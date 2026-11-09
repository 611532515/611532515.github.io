/* AI 音樂創作教室 — 共用互動 */
(function () {
  'use strict';

  /* ---------- 漢堡選單 ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
      menu.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    window.matchMedia('(min-width: 880px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- 首頁音波 ---------- */
  var wave = document.querySelector('.wave');
  if (wave) {
    var count = window.innerWidth < 600 ? 32 : 56;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var bar = document.createElement('span');
      // 以兩個正弦波疊加做出像音樂的起伏，固定公式，不使用亂數，畫面穩定
      var h = 0.35 + 0.4 * Math.abs(Math.sin(i * 0.45)) + 0.25 * Math.abs(Math.sin(i * 1.3));
      bar.style.setProperty('--h', Math.min(h, 1).toFixed(2));
      bar.style.setProperty('--d', (-(i % 9) * 0.13).toFixed(2) + 's');
      frag.appendChild(bar);
    }
    wave.appendChild(frag);
  }

  /* ---------- 頁尾年份 ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 報名表單（不實際送出） ---------- */
  var form = document.getElementById('signup-form');
  if (!form) return;

  var storeField = document.getElementById('store-field');
  var storeSelect = document.getElementById('store');
  var confirmBox = document.getElementById('confirm');

  var planLabels = {
    A: '方案 A｜門市面授實戰班（RMB 898）',
    B: '方案 B｜線上自學健檢班（RMB 398）'
  };

  function currentPlan() {
    var checked = form.querySelector('input[name="plan"]:checked');
    return checked ? checked.value : '';
  }

  function syncStore() {
    var isA = currentPlan() === 'A';
    storeField.hidden = !isA;
    storeSelect.required = isA;
    if (!isA) clearError(storeSelect);
  }

  // 從課程頁帶入方案：signup.html?plan=A
  var param = new URLSearchParams(location.search).get('plan');
  if (param === 'A' || param === 'B') {
    var radio = form.querySelector('input[name="plan"][value="' + param + '"]');
    if (radio) radio.checked = true;
  }
  syncStore();
  form.addEventListener('change', function (e) {
    if (e.target.name === 'plan') {
      syncStore();
      setError(document.getElementById('plan-error'), null, '');
    }
  });

  function setError(errEl, input, msg) {
    if (errEl) errEl.textContent = msg;
    if (input) {
      if (msg) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }
  function clearError(input) {
    setError(document.getElementById(input.id + '-error'), input, '');
  }

  ['name', 'wechat', 'store'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', function () { clearError(el); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    var plan = currentPlan();

    if (!plan) {
      setError(document.getElementById('plan-error'), null, '請選擇一個方案。');
      firstInvalid = firstInvalid || form.querySelector('input[name="plan"]');
    }

    var name = document.getElementById('name');
    if (!name.value.trim()) {
      setError(document.getElementById('name-error'), name, '請填寫姓名。');
      firstInvalid = firstInvalid || name;
    }

    var wechat = document.getElementById('wechat');
    var wv = wechat.value.trim();
    if (!wv) {
      setError(document.getElementById('wechat-error'), wechat, '請填寫微信號，方便老師聯繫你。');
      firstInvalid = firstInvalid || wechat;
    } else if (!/^[A-Za-z][-_A-Za-z0-9]{5,19}$/.test(wv)) {
      setError(document.getElementById('wechat-error'), wechat, '微信號為 6–20 個字元，以英文字母開頭，可含數字、底線或減號。');
      firstInvalid = firstInvalid || wechat;
    }

    if (plan === 'A' && !storeSelect.value) {
      setError(document.getElementById('store-error'), storeSelect, '面授班請選擇上課門市。');
      firstInvalid = firstInvalid || storeSelect;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // 只在畫面上顯示確認內容，不傳送任何資料
    var song = document.getElementById('song').value.trim();
    var rows = [
      ['方案', planLabels[plan]],
      ['姓名', name.value.trim()],
      ['微信號', wv]
    ];
    if (plan === 'A') rows.push(['門市', storeSelect.options[storeSelect.selectedIndex].text]);
    rows.push(['想做的歌', song || '（未填寫）']);

    var dl = document.getElementById('confirm-list');
    dl.innerHTML = '';
    rows.forEach(function (r) {
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = r[0];
      dd.textContent = r[1];
      dl.appendChild(dt);
      dl.appendChild(dd);
    });

    form.hidden = true;
    confirmBox.hidden = false;
    var heading = confirmBox.querySelector('h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  });

  document.getElementById('reset-form').addEventListener('click', function () {
    form.reset();
    syncStore();
    confirmBox.hidden = true;
    form.hidden = false;
    form.querySelector('input[name="plan"]').focus();
  });
})();
