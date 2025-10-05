(function(){
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
  var WindParticle = function () {
    this.name = "WindParticle";
    this.animationDuration = 1200;
    this._initOnce = false;
    this.draw = function(ctx, percent){
      if(!this._initOnce){
        this.size = 10;
        this.wind = 10 + Math.random() * 25;
        this.lift = 20 + Math.random() * 20;
        this.swing = Math.random() * 6 + 3;
        this.freq = Math.random() * 6 + 3;
        this.fade = 0.50 + Math.random() * 0.50;
        this.seed = Math.random() * Math.PI * 2;
        this._initOnce = true;
      }
      var t = easeOutCubic(percent);
      var nx = this.startX + t * this.wind + Math.sin(this.seed + t * this.freq) * this.swing;
      var ny = this.startY - t * this.lift + Math.cos(this.seed + t * this.freq * 0.7) * 4;
      var a = (1 - t) * (this.rgbArray[3] != null ? this.rgbArray[3] / 255 : 1) * this.fade;
      ctx.fillStyle = "rgba(" + this.rgbArray[0] + "," + this.rgbArray[1] + "," + this.rgbArray[2] + "," + a + ")";
      ctx.fillRect(nx, ny, this.size, this.size);
    };
  };
  document.addEventListener('DOMContentLoaded', function () {
    if (window.disintegrate && typeof disintegrate.addParticleType === "function") {
      disintegrate.addParticleType(WindParticle);
    }
    function bindDelete(){
      document.querySelectorAll('.items a[href^="/delete/"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const li   = this.closest('li');
          const href = this.getAttribute('href');
          const disObj = disintegrate.getDisObj(li);
          disintegrate.createSimultaneousParticles(disObj);
          li.style.visibility = 'hidden';
          li.addEventListener('disComplete', function onDone() {
            li.removeEventListener('disComplete', onDone);
            fetch(href, { method: 'GET', headers: { 'X-Requested-With': 'fetch' } })
              .finally(() => li.remove());
          });
        });
      });
    }
    window.addEventListener('disesLoaded', bindDelete);
    if (window.disintegrate) disintegrate.init();
  });
})();