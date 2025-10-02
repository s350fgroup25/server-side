(function () {
  const btn5 = document.getElementById('gen-5');
  const btn100 = document.getElementById('gen-100');
  if (!btn5 || !btn100) return;
  const adjectives = [
    'Red','Blue','Green','Golden','Silver','Black','White','Purple',
    'Fast','Slow','New','Old','Big','Small','Hot','Cold',
    'Sharp','Bright','Heavy','Light'
  ];
  const nouns = [
    'Apple','Banana','Screw','Notebook','Cup','Box','Mouse','Keyboard',
    'Battery','Headphone','Gum','Sticker','Pencil','Sponge','Nut','Cookie',
    'Book','Table','Chair','Bottle','Phone','Bag','Lamp','Coin','Knife'
  ];
  const randomName = () => {
    const a = adjectives[Math.floor(Math.random() * adjectives.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    return a + n;
  };
  const randomQty = () => Math.floor(Math.random() * 1000) + 1;
  const postItem = async (name, quantity) => {
    const body = new URLSearchParams({ name, quantity }).toString();
    const res = await fetch('/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      credentials: 'same-origin'
    });
    return res.ok;
  };
  const setBusy = (busy, label) => {
    [btn5, btn100].forEach(b => {
      b.disabled = busy;
      if (busy && b === label.btn) {
        label.prev = b.textContent;
        b.textContent = label.text;
      } else if (!busy && label.prev) {
        label.btn.textContent = label.prev;
      }
    });
  };
  async function generate(count, triggerBtn) {
    setBusy(true, { btn: triggerBtn, text: `Generating ${count}` });
    let allOk = true;
    const CONCURRENCY = 10;
    let i = 0;
    const worker = async () => {
      while (true) {
        const idx = i++;
        if (idx >= count) break;
        try {
          const ok = await postItem(randomName(), randomQty());
          if (!ok) allOk = false;
        } catch {
          allOk = false;
        }
      }
    };
    try {
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, count) }, worker));
    } finally {
      setBusy(false, { btn: triggerBtn });
    }
    if (allOk) {
      location.href = '/';
    } else {
      alert('Something wrong');
    }
  }
  btn5.addEventListener('click', () => generate(5, btn5));
  btn100.addEventListener('click', () => generate(100, btn100));
})();