/**
 * Generates the JavaScript string to be injected into the Google Form WebView.
 * It waits for the form to fully render, fills all fields, and submits.
 */
export function buildFormScript(params: {
  opsId: string;
  namaLengkap: string;
  nomorWa: string;
}): string {
  const { opsId, namaLengkap, nomorWa } = params;

  return `
(function() {
  if (window.location.hostname.indexOf('docs.google.com') === -1) {
    return; // Stop script on Google Login pages (accounts.google.com)
  }

  var pageText = document.body ? document.body.textContent.toLowerCase() : '';

  // Check if login is required
  if (pageText.indexOf('login untuk melanjutkan') !== -1 ||
      pageText.indexOf('anda harus login') !== -1 ||
      pageText.indexOf('login to continue') !== -1 ||
      pageText.indexOf('you must be logged in') !== -1) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage('NEEDS_LOGIN');
    }
    return;
  }

  // Check if it's the success page
  if (pageText.indexOf('telah direkam') !== -1 || pageText.indexOf('has been recorded') !== -1 || pageText.indexOf('jawaban anda telah') !== -1) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage('SUCCESS');
    }
    return;
  }

  function fireEvents(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillForm() {
    try {
      // 1. Email collection checkbox – tick it if present
      var cbs = document.querySelectorAll('[role="checkbox"]');
      for (var i = 0; i < cbs.length; i++) {
        var cb = cbs[i];
        var ariaLabel = (cb.getAttribute('aria-label') || '').toLowerCase();
        var pText = (cb.parentElement && cb.parentElement.parentElement ? cb.parentElement.parentElement.textContent : '').toLowerCase();
        if (ariaLabel.indexOf('email') !== -1 || pText.indexOf('email') !== -1) {
          if (pText.indexOf('rekam') !== -1 || pText.indexOf('record') !== -1 || pText.indexOf('disertakan') !== -1 || ariaLabel.indexOf('rekam') !== -1) {
            if (cb.getAttribute('aria-checked') === 'false') {
              cb.click();
            }
          }
        }
      }

      // Google Forms: all short-answer inputs are <input> inside question containers
      var questions = document.querySelectorAll('[data-params]');

      questions.forEach(function(q) {
        var label = q.querySelector('[role="heading"]') || q.querySelector('.freebirdFormviewerComponentsQuestionBaseTitle');
        if (!label) return;
        var text = label.textContent.trim().toLowerCase();

        // Use else-if so a question isn't matched multiple times
        // Ops ID
        if (text.indexOf('ops id') !== -1 || text.indexOf('opsid') !== -1) {
          var inp = q.querySelector('input[type="text"]');
          if (inp) { inp.value = ${JSON.stringify(opsId)}; fireEvents(inp); }
        }
        // Nama Lengkap
        else if (text.indexOf('nama') !== -1) {
          var inp = q.querySelector('input[type="text"]');
          if (inp) { inp.value = ${JSON.stringify(namaLengkap)}; fireEvents(inp); }
        }
        // Konfirmasi Kehadiran – radio "Siap Hadir"
        else if (text.indexOf('konfirmasi') !== -1 || text.indexOf('kehadiran') !== -1) {
          var radios = q.querySelectorAll('[role="radio"]');
          radios.forEach(function(radio) {
            var radioLabel = radio.textContent || radio.getAttribute('aria-label') || '';
            if (radioLabel.toLowerCase().indexOf('siap hadir') !== -1) {
              radio.click();
            }
          });
        }
        // Nomor WhatsApp
        else if (text.indexOf('whatsapp') !== -1 || text.indexOf('wa') !== -1 || text.indexOf('nomor') !== -1) {
          var inp = q.querySelector('input[type="text"]');
          if (inp) { inp.value = ${JSON.stringify(nomorWa)}; fireEvents(inp); }
        }
        // Shift dropdown
        else if (text.indexOf('shift') !== -1) {
          // Google Forms uses custom listbox for dropdowns
          var listbox = q.querySelector('[role="listbox"]');
          if (listbox) {
            // Open the dropdown
            listbox.click();
            setTimeout(function() {
              var allOptions = document.querySelectorAll('[role="option"]');
              for (var i = 0; i < allOptions.length; i++) {
                var dVal = allOptions[i].getAttribute('data-value');
                var txt = (allOptions[i].textContent || '').trim().toLowerCase();
                // Ensure we don't click the "Pilih" / "Choose" placeholder
                if (dVal && dVal.trim() !== '' && txt.indexOf('pilih') === -1) {
                  allOptions[i].click();
                  break;
                }
              }
            }, 800);
          }
        }
      });

      // Submit the form after a delay to allow dropdowns to close
      setTimeout(function() {
        // Try the native submit button first
        var submitBtns = document.querySelectorAll('[role="button"]');
        var submitted = false;
        submitBtns.forEach(function(btn) {
          if (!submitted) {
            var t = btn.textContent.trim().toLowerCase();
            if (t === 'submit' || t === 'kirim' || t === 'next' || t === 'berikutnya') {
              btn.click();
              submitted = true;
            }
          }
        });
        if (!submitted) {
          // Fallback: click any element with "Submit" in its text
          var all = document.querySelectorAll('*');
          for (var i = 0; i < all.length; i++) {
            var txt = all[i].childElementCount === 0 ? all[i].textContent.trim().toLowerCase() : '';
            if (txt === 'submit' || txt === 'kirim') {
              all[i].click();
              break;
            }
          }
        }
      }, 2000);

    } catch(e) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ERROR:' + e.message);
    }
  }

  // Wait for the form to render
  if (document.readyState === 'complete') {
    setTimeout(fillForm, 1500);
  } else {
    window.addEventListener('load', function() {
      setTimeout(fillForm, 1500);
    });
  }

  // MutationObserver fallback – triggers once a form question appears
  var triggered = false;
  var observer = new MutationObserver(function() {
    if (!triggered && document.querySelector('[data-params]')) {
      triggered = true;
      observer.disconnect();
      setTimeout(fillForm, 1200);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
true; // required by react-native-webview
`;
}
