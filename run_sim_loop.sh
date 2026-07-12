#!/usr/bin/env bash
# Continuous simulator loop — 1000 iterations, all 3 personas per run.
# Runs in the background; progress logged to /tmp/sim_loop.log

API="http://localhost:8080"
TOTAL=1000
LOG=/tmp/sim_loop.log
ERRORS=/tmp/sim_loop_errors.log

echo "[$(date -u +%FT%TZ)] Starting $TOTAL-iteration sim loop" | tee -a "$LOG"

for i in $(seq 1 $TOTAL); do
  ITER_START=$(date +%s%N)

  # ── 1. Simulate all 3 personas in parallel ─────────────────────────────────
  curl -sf --max-time 120 -X POST "$API/api/simulate" \
    -H "Content-Type: application/json" -d '{"persona":"investor"}' \
    -o /tmp/s_inv.json &
  PID_INV=$!

  curl -sf --max-time 120 -X POST "$API/api/simulate" \
    -H "Content-Type: application/json" -d '{"persona":"skier"}' \
    -o /tmp/s_ski.json &
  PID_SKI=$!

  curl -sf --max-time 120 -X POST "$API/api/simulate" \
    -H "Content-Type: application/json" -d '{"persona":"tourist"}' \
    -o /tmp/s_tou.json &
  PID_TOU=$!

  wait $PID_INV; R_INV=$?
  wait $PID_SKI; R_SKI=$?
  wait $PID_TOU; R_TOU=$?

  if [ $R_INV -ne 0 ] || [ $R_SKI -ne 0 ] || [ $R_TOU -ne 0 ]; then
    MSG="[$(date -u +%FT%TZ)] iter $i — simulate FAILED (investor=$R_INV skier=$R_SKI tourist=$R_TOU), skipping"
    echo "$MSG" | tee -a "$LOG" >> "$ERRORS"
    continue
  fi

  # ── 2. Compute scores + build improve payload ───────────────────────────────
  RESULTS=$(node -e "
    const inv = require('/tmp/s_inv.json');
    const ski = require('/tmp/s_ski.json');
    const tou = require('/tmp/s_tou.json');
    process.stdout.write(JSON.stringify([inv, ski, tou]));
  " 2>/dev/null)

  if [ -z "$RESULTS" ]; then
    echo "[$(date -u +%FT%TZ)] iter $i — JSON parse FAILED, skipping" | tee -a "$LOG" >> "$ERRORS"
    continue
  fi

  # ── 3. Improve ──────────────────────────────────────────────────────────────
  curl -sf --max-time 120 -X POST "$API/api/improve" \
    -H "Content-Type: application/json" \
    -d "{\"results\": $RESULTS}" \
    -o /tmp/s_improve.json
  R_IMP=$?

  if [ $R_IMP -ne 0 ]; then
    echo "[$(date -u +%FT%TZ)] iter $i — improve FAILED ($R_IMP), skipping" | tee -a "$LOG" >> "$ERRORS"
    continue
  fi

  # ── 4. Apply ────────────────────────────────────────────────────────────────
  APPLY_PAYLOAD=$(node -e "
    const inv = require('/tmp/s_inv.json');
    const ski = require('/tmp/s_ski.json');
    const tou = require('/tmp/s_tou.json');
    const improvements = require('/tmp/s_improve.json');
    const scores = {
      investor: inv.sections.map(s => ({ id: s.id, score: s.score })),
      skier:    ski.sections.map(s => ({ id: s.id, score: s.score })),
      tourist:  tou.sections.map(s => ({ id: s.id, score: s.score })),
    };
    process.stdout.write(JSON.stringify({ improvements, scores }));
  " 2>/dev/null)

  curl -sf --max-time 90 -X POST "$API/api/apply" \
    -H "Content-Type: application/json" \
    -d "$APPLY_PAYLOAD" \
    -o /tmp/s_apply.json
  R_APP=$?

  # ── 5. Log result ───────────────────────────────────────────────────────────
  ELAPSED=$(( ($(date +%s%N) - ITER_START) / 1000000 ))

  if [ $R_APP -ne 0 ]; then
    echo "[$(date -u +%FT%TZ)] iter $i — apply FAILED ($R_APP) [${ELAPSED}ms]" | tee -a "$LOG" >> "$ERRORS"
    continue
  fi

  AVG=$(node -e "
    const inv = require('/tmp/s_inv.json');
    const ski = require('/tmp/s_ski.json');
    const tou = require('/tmp/s_tou.json');
    const all = [...inv.sections, ...ski.sections, ...tou.sections];
    const avg = (all.reduce((s,x)=>s+x.score,0)/all.length).toFixed(2);
    const invAvg = (inv.sections.reduce((s,x)=>s+x.score,0)/inv.sections.length).toFixed(1);
    const skiAvg = (ski.sections.reduce((s,x)=>s+x.score,0)/ski.sections.length).toFixed(1);
    const touAvg = (tou.sections.reduce((s,x)=>s+x.score,0)/tou.sections.length).toFixed(1);
    process.stdout.write('avg='+avg+' inv='+invAvg+' ski='+skiAvg+' tou='+touAvg);
  " 2>/dev/null)

  echo "[$(date -u +%FT%TZ)] iter $i/$TOTAL OK — $AVG [${ELAPSED}ms]" | tee -a "$LOG"

done

echo "[$(date -u +%FT%TZ)] Loop complete: $TOTAL iterations done." | tee -a "$LOG"
