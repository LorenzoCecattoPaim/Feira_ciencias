
    // Elementos
    const redRange = document.getElementById('redCount');
    const blueRange = document.getElementById('blueCount');
    const redDisplay = document.getElementById('redCountDisplay');
    const blueDisplay = document.getElementById('blueCountDisplay');
    const theoreticalP = document.getElementById('theoreticalP');
    const theoryExplain = document.getElementById('theoryExplain');
    const oneDrawBtn = document.getElementById('oneDrawBtn');
    const simulateBtn = document.getElementById('simulateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultBox = document.getElementById('resultBox');
    const nSimsInput = document.getElementById('nSims');
    const drawsPerSimInput = document.getElementById('drawsPerSim');
    const empiricalP = document.getElementById('empiricalP');
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');

    function updateDisplays(){
      const r = parseInt(redRange.value,10);
      const b = parseInt(blueRange.value,10);
      redDisplay.textContent = r;
      blueDisplay.textContent = b;
      const total = r + b;
      if(total === 0){
        theoreticalP.textContent = '—';
        theoryExplain.textContent = 'A urna está vazia. Adicione bolas.';
      } else {
        const p = r/total;
        theoreticalP.textContent = (p*100).toFixed(2) + '%';
        theoryExplain.textContent = `${r}/${total} = ${p.toFixed(4)} (probabilidade de vermelho)`;
      }
    }

    redRange.addEventListener('input', updateDisplays);
    blueRange.addEventListener('input', updateDisplays);
    updateDisplays();

    function drawChart(redCount, blueCount, redEmpirical, blueEmpirical){
      // Clear
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // scales
      const pad = 24;
      const w = canvas.width - pad*2;
      const h = canvas.height - pad*2;

      // theoretical bars
      const total = redCount + blueCount;
      const pRed = total ? redCount/total : 0;
      const pBlue = total ? blueCount/total : 0;

      // bar widths
      const bw = w/4;
      const redH = h * pRed;
      const blueH = h * pBlue;

      // empirical bars normalized
      const empTotal = redEmpirical + blueEmpirical || 1;
      const eRedH = h * (redEmpirical/empTotal);
      const eBlueH = h * (blueEmpirical/empTotal);

      // draw axes labels
      ctx.font = '12px Inter, system-ui';
      ctx.fillStyle = '#cfeefc';
      ctx.fillText('Teórico', pad + 10, pad - 6);
      ctx.fillText('Empírico', pad + bw + 60, pad - 6);

      // draw theoretical red
      const xT = pad + 20;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(xT, pad + (h - redH), bw, redH);
      ctx.fillStyle = '#cfeefc';
      ctx.fillText(`Vermelho ${(pRed*100).toFixed(1)}%`, xT, pad + h + 16);

      // theoretical blue
      const xTb = xT + bw + 10;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(xTb, pad + (h - blueH), bw, blueH);
      ctx.fillStyle = '#cfeefc';
      ctx.fillText(`Azul ${(pBlue*100).toFixed(1)}%`, xTb, pad + h + 16);

      // empirical bars
      const xE = pad + bw*2 + 90;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(xE, pad + (h - eRedH), bw, eRedH);
      ctx.fillStyle = '#cfeefc';
      ctx.fillText(`Vermelho ${(100*redEmpirical/empTotal).toFixed(1)}%`, xE, pad + h + 16);

      const xEb = xE + bw + 10;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(xEb, pad + (h - eBlueH), bw, eBlueH);
      ctx.fillStyle = '#cfeefc';
      ctx.fillText(`Azul ${(100*blueEmpirical/empTotal).toFixed(1)}%`, xEb, pad + h + 16);

      // small legend
      ctx.fillStyle = '#ef4444'; ctx.fillRect(canvas.width - 140, 16, 12, 12); ctx.fillStyle='#cfeefc'; ctx.fillText('Vermelho', canvas.width - 120, 26);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(canvas.width - 140, 36, 12, 12); ctx.fillStyle='#cfeefc'; ctx.fillText('Azul', canvas.width - 120, 46);
    }

    // Single draw: with replacement
    oneDrawBtn.addEventListener('click', ()=>{
      const r = parseInt(redRange.value,10);
      const b = parseInt(blueRange.value,10);
      const total = r + b;
      if(total === 0){
        resultBox.style.display = 'block';
        resultBox.textContent = 'Urna vazia! Ajuste as bolas.';
        return;
      }
      // draw a random ball
      const x = Math.random() * total;
      const isRed = x < r;
      resultBox.style.display = 'block';
      resultBox.innerHTML = isRed ? '<strong>Você tirou uma bola VERMELHA!</strong>' : '<strong>Você tirou uma bola AZUL.</strong>';

      // update chart with single empirical result
      drawChart(r,b, isRed?1:0, isRed?0:1);
      empiricalP.textContent = isRed ? '100% (1/1)' : '0% (0/1)';
    });

    // Simulation (many trials)
    simulateBtn.addEventListener('click', ()=>{
      const r = parseInt(redRange.value,10);
      const b = parseInt(blueRange.value,10);
      const total = r + b;
      if(total === 0){
        resultBox.style.display = 'block';
        resultBox.textContent = 'Urna vazia! Ajuste as bolas.';
        return;
      }
      const nSims = Math.min(200000, Math.max(1, parseInt(nSimsInput.value,10)||1000));
      const drawsPerSim = Math.min(1000, Math.max(1, parseInt(drawsPerSimInput.value,10)||1));

      resultBox.style.display = 'block';
      resultBox.innerHTML = `Executando ${nSims} simulações (${drawsPerSim} retiradas cada) — isso pode levar alguns segundos...`;

      // Run simulation: for each simulation, count number of red in drawsPerSim; we count totals across all individual draws (so empirical frequency per single draw)
      let redTotal = 0;
      let blueTotal = 0;
      for(let i=0;i<nSims;i++){
        for(let j=0;j<drawsPerSim;j++){
          const x = Math.random() * total;
          if(x < r) redTotal++; else blueTotal++;
        }
      }

      const empirical = redTotal / (redTotal + blueTotal);
      empiricalP.textContent = (empirical*100).toFixed(3) + '%';
      resultBox.innerHTML = `<strong>Simulação completa.</strong><br>Vermelhas: ${redTotal} — Azuis: ${blueTotal} — Frequência vermelha: ${(empirical*100).toFixed(3)}%`;
      drawChart(r,b,redTotal,blueTotal);
    });

    resetBtn.addEventListener('click', ()=>{
      redRange.value = 3; blueRange.value = 2; nSimsInput.value = 1000; drawsPerSimInput.value = 1;
      updateDisplays();
      resultBox.style.display = 'none';
      empiricalP.textContent = '—';
      drawChart(3,2,0,0);
    });

    // initial chart
    drawChart(3,2,0,0);