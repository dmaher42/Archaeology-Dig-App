(() => {
  const STYLE_ID = 'year7-ui-focus-fixes';
  const OBSERVER_FLAG = '__year7UiFixObserver';

  const css = `
    /* Year 7 UI/UX focus patch: make task screens easier to finish on classroom laptops. */
    .main-content {
      overflow-y: auto !important;
      min-height: 0 !important;
    }

    .phase-container {
      height: auto !important;
      min-height: 100% !important;
      overflow: visible !important;
      padding-bottom: 5rem !important;
    }

    .dig-phase,
    .bureau-phase,
    .training-phase,
    .menu-phase,
    .museum-phase,
    .report-phase {
      height: auto !important;
      overflow: visible !important;
    }

    body.ux-lab-phase .ux-hidden-panel {
      display: none !important;
    }

    body.ux-lab-phase .ux-primary-panel {
      min-height: min(64vh, 640px) !important;
      max-height: none !important;
      overflow: visible !important;
      flex: 1 1 680px !important;
      width: 100% !important;
    }

    body.ux-lab-phase .ux-primary-panel textarea,
    body.ux-lab-phase textarea {
      min-height: 120px !important;
    }

    body.ux-lab-phase .ux-primary-panel button,
    body.ux-lab-phase button {
      min-height: 42px;
    }

    body.ux-lab-phase .ux-lab-progress-note {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      margin-left: .5rem;
      padding: .22rem .55rem;
      border: 1px solid rgba(232, 158, 93, 0.32);
      border-radius: 999px;
      background: rgba(232, 158, 93, 0.10);
      color: var(--sand-100, #F4ECE1);
      font-size: .78rem;
      font-weight: 800;
      white-space: nowrap;
      vertical-align: middle;
    }

    body.ux-lab-phase .ux-lab-helper {
      margin: .65rem 0 .25rem;
      padding: .62rem .78rem;
      border: 1px solid rgba(232, 158, 93, .25);
      border-radius: 14px;
      background: rgba(232, 158, 93, .08);
      color: var(--sand-100, #F4ECE1);
      font-weight: 700;
      line-height: 1.35;
    }

    .bureau-phase {
      padding-bottom: 6rem !important;
    }

    .bureau-case-dossier,
    .bureau-clue-stage,
    .bureau-feedback-card,
    .bureau-comparison-card,
    .bureau-panel {
      max-height: none !important;
      overflow: visible !important;
    }

    .bureau-answer-grid {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
    }

    .bureau-sticky-action-bar {
      position: sticky !important;
      bottom: .75rem !important;
      z-index: 50 !important;
      display: flex !important;
      flex-wrap: wrap !important;
      gap: .65rem !important;
      justify-content: flex-end !important;
      padding: .7rem !important;
      margin-top: .85rem !important;
      border: 1px solid rgba(232, 158, 93, 0.28) !important;
      border-radius: 16px !important;
      background: rgba(22, 15, 9, 0.94) !important;
      box-shadow: 0 -8px 24px rgba(0, 0, 0, .28) !important;
      backdrop-filter: blur(10px);
    }

    @media (max-width: 900px), (max-height: 760px) {
      .bureau-layout,
      .activity-menu-grid,
      .training-layout {
        grid-template-columns: 1fr !important;
      }

      .bureau-sidebar,
      .bureau-main {
        min-height: auto !important;
      }
    }

    [class*='museum'],
    [class*='exhibition'] {
      overflow: visible !important;
      max-height: none !important;
    }

    [class*='museum'] [class*='statement'],
    [class*='exhibition'] [class*='statement'] {
      position: relative !important;
      inset: auto !important;
      z-index: auto !important;
      margin-top: .75rem !important;
    }
  `;

  const replacements = [
    [/Make Investigative Claim/g, 'Make a Guess'],
    [/Investigative Claim/g, 'Guess'],
    [/investigative claim/g, 'guess'],
    [/Submit My Claim/g, 'Submit Guess'],
    [/Submit Claim/g, 'Submit Guess'],
    [/Claim value/g, 'Guess now'],
    [/claim value/g, 'guess now'],
    [/Evidence Trail/g, 'Clues'],
    [/evidence trail/g, 'clues'],
    [/Current File/g, 'Current Case'],
    [/Suspect Board/g, 'Possible Civilisations'],
    [/suspects/g, 'choices'],
    [/Suspects/g, 'Choices'],
    [/suspect/g, 'choice'],
    [/Suspect/g, 'Choice'],
    [/Archive/g, 'Remove'],
    [/archive/g, 'remove'],
    [/Archived/g, 'Removed'],
    [/archived/g, 'removed'],
    [/Restore/g, 'Bring back'],
    [/Record log entry/g, 'Submit Log'],
    [/Discovery Report/g, 'Case'],
    [/dossier/g, 'case'],
    [/Dossier/g, 'Case'],
  ];

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  };

  const visible = (el) => {
    if (!el || !(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  };

  const nearestPanel = (el) => {
    if (!el) return null;
    return el.closest('.glass-card, article, aside, section, .panel, .lab-panel, .analysis-panel, .bureau-panel') || el.closest('div');
  };

  const directText = (el) => Array.from(el.childNodes)
    .filter(child => child.nodeType === Node.TEXT_NODE)
    .map(child => child.textContent || '')
    .join(' ')
    .trim();

  const elementsWithDirectText = (needle) => {
    const matches = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();
    while (node) {
      if (node instanceof HTMLElement && visible(node) && directText(node).includes(needle)) {
        matches.push(node);
      }
      node = walker.nextNode();
    }
    return matches;
  };

  const replaceTextNodes = () => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const nodes = [];
    let node = walker.nextNode();
    while (node) {
      nodes.push(node);
      node = walker.nextNode();
    }

    nodes.forEach(textNode => {
      let value = textNode.textContent || '';
      replacements.forEach(([pattern, simple]) => {
        value = value.replace(pattern, simple);
      });
      textNode.textContent = value;
    });
  };

  const markLabScreen = () => {
    const bodyText = document.body.innerText || '';
    const isLab = bodyText.includes('Analysis Bench') || bodyText.includes('Research Notes') || /\d+\s*\/\s*3\s*analysed/i.test(bodyText);
    document.body.classList.toggle('ux-lab-phase', isLab);
    if (!isLab) return;

    elementsWithDirectText('Research Notes').forEach(el => {
      const panel = nearestPanel(el);
      if (panel && !panel.classList.contains('ux-primary-panel')) panel.classList.add('ux-hidden-panel');
    });

    elementsWithDirectText('Analysis Bench').forEach(el => {
      const panel = nearestPanel(el);
      if (panel) panel.classList.add('ux-primary-panel');
    });

    const progressText = (bodyText.match(/\b\d+\s*\/\s*3\s*analysed\b/i) || [])[0];
    const heading = elementsWithDirectText('Analysis Bench')[0];
    if (heading && progressText && !heading.querySelector('.ux-lab-progress-note')) {
      const badge = document.createElement('span');
      badge.className = 'ux-lab-progress-note';
      badge.textContent = progressText;
      heading.appendChild(badge);
    }

    const primary = document.querySelector('.ux-primary-panel');
    if (primary && !primary.querySelector('.ux-lab-helper')) {
      const helper = document.createElement('div');
      helper.className = 'ux-lab-helper';
      helper.textContent = 'Choose a find. Answer the question. Write a short note. Save your analysis.';
      const firstChild = primary.children[1] || primary.firstElementChild;
      if (firstChild) firstChild.insertAdjacentElement('afterend', helper);
      else primary.prepend(helper);
    }
  };

  const simplifyButtons = () => {
    document.querySelectorAll('button, [role="button"]').forEach(button => {
      const text = (button.textContent || '').trim();
      if (text === 'Open Bureau') button.textContent = 'Start Bureau Game';
      if (text === 'Make Investigative Claim') button.textContent = 'Make a Guess';
      if (text === 'Submit My Claim') button.textContent = 'Submit Guess';
      if (text === 'Archive') button.textContent = 'Remove';
      if (text === 'Restore') button.textContent = 'Bring back';
      if (text === 'Record log entry') button.textContent = 'Submit Log';
    });
  };

  const apply = () => {
    injectStyle();
    replaceTextNodes();
    markLabScreen();
    simplifyButtons();
  };

  const schedule = () => window.requestAnimationFrame(apply);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }

  if (!window[OBSERVER_FLAG]) {
    window[OBSERVER_FLAG] = true;
    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }
})();
