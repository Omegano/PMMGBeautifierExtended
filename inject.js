(function () {
      function toFixed(value, precision) {
        const power = Math.pow(10, precision || 0);
        return String(Math.round(value * power) / power);
      }

      /**
       * Parse all localmarket ads and display the per unit price
       */
      function parseLocalmarketAds() {
        const elements = document.querySelectorAll("div[class^='CommodityAd__text___'");

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const text = element.textContent;
          const matches = text.match(/(?:BUYING|SELLING)\s(\d+)\s.*\s@\s([\d,.]+)\s[A-Z]+\sfor/);
          if (matches && matches.length > 2) {
            const count = matches[1];
            const totalCents = parseInt(matches[2].replace(/[,.]/g, ''));
            const perItem = toFixed(totalCents / count / 100, 2);
            const span = element.children[0].children[1];
            span.textContent += ` (${perItem} ea)`;
          }
        }
      }

      function convertDurationToETA(duration) {
        const days = duration.match(/(\d+)\s*d/);
        const hours = duration.match(/(\d+)\s*h/);
        const minutes = duration.match(/(\d+)\s*m/);
        const seconds = duration.match(/(\d+)\s*s/);

        let parsedSeconds = 0;
        if (days) {
          parsedSeconds += parseInt(days[1]) * 86400;
        }
        if (hours) {
          parsedSeconds += parseInt(hours[1]) * 3600;
        }
        if (minutes) {
          parsedSeconds += parseInt(minutes[1]) * 60;
        }
        if (seconds) {
          parsedSeconds += parseInt(seconds[1]);
        }
        const eta = new Date();
        const now = new Date();
        eta.setSeconds(eta.getSeconds() + parsedSeconds);
        const diffTime = Math.abs(eta - now);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let ret = eta.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        if (diffDays > 0) {
          ret += ` +${diffDays}d`;
        }
        return ret;
      }

      /**
       * Parse all ETA times and add the actual date-time of arrival
       */
      function parseETAs() {
        const elements = document.querySelectorAll("table[class^='Fleet__table___'");
        elements.forEach((tableElem) => {
          const tableRows = Array.from(tableElem.getElementsByTagName("tbody")[0].children);
          tableRows.forEach((row) => {
            // find first entry that is no button but contains a span
            const targetRow = Array.from(row.children).reverse().find(elem =>
                elem.querySelector(":scope > span")
            );
            if (targetRow) {
              const childSpans = targetRow.getElementsByTagName("span");
              const textContent = childSpans[0].textContent.split('(')[0];
              const eta = convertDurationToETA(textContent);
              const newSpan = document.createElement("span");
              newSpan.classList.add("prun-remove-js");
              newSpan.textContent = ` (${eta})`;
              targetRow.appendChild(newSpan);
            }
          });
        });
      }

      function parseOrderETAs() {
        const elements = document.querySelectorAll("div[class^='OrderSlot__info___'");
        elements.forEach((order) => {
          // we are only interested in active orders, so check for progress bar first
          if (order.querySelectorAll("span[class^='OrderStatus__inProgress___'").length > 0) {
            const etaSpan = order.getElementsByTagName("span")[1].children[0];
            const eta = convertDurationToETA(etaSpan.textContent);

            const newSpan = document.createElement("span");
            newSpan.classList.add("prun-remove-js");
            newSpan.textContent = ` (${eta})`;
            order.appendChild(newSpan);
          }
        });
      }

      function cleanup() {
        // remove all elements added in the last run
        Array.from(document.getElementsByClassName("prun-remove-js")).forEach((elem) => {
          elem.parentNode.removeChild(elem);
        });
      }

      window.setInterval(() => {
        cleanup();
        parseLocalmarketAds();
        parseETAs();
        parseOrderETAs();
      }, 1000);
    }
)();