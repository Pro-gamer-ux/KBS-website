(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('page-transition');
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('page-ready')));

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', e => {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = 'Menu';
      }
    });
  }
  document.querySelectorAll('a[data-page]').forEach(link => link.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target || reduceMotion) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || destination.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.remove('page-ready');
    setTimeout(() => { location.href = destination.href; }, 180);
  }));

  const menus=[...document.querySelectorAll('.nav-menu')];
  menus.forEach(menu=>menu.addEventListener('toggle',()=>{if(menu.open)menus.forEach(other=>{if(other!==menu)other.open=false;});}));
  document.addEventListener('click',event=>{if(!event.target.closest('.nav-menu'))menus.forEach(menu=>menu.open=false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){menus.forEach(menu=>menu.open=false);document.querySelector('.nav-menu summary')?.focus();}});
  const year = document.querySelectorAll('[data-year]');
  year.forEach(el => el.textContent = new Date().getFullYear());

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(items => items.forEach(item => {
      if (item.isIntersecting) { item.target.classList.add('visible'); io.unobserve(item.target); }
    }), { threshold: .12 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  const knowledge = window.KBS_FAQ || [];
  const addAnswer = (container, text) => {
    if(container.classList.contains('assistant-reply')&&text.length>260){let cut=text.lastIndexOf('. ',225);if(cut<150)cut=text.indexOf('. ',225);if(cut<0||cut>350){cut=text.lastIndexOf(' ',220);}const lead=cut>0?text.slice(0,cut+1):text.slice(0,210).trimEnd()+'…';container.append(document.createTextNode(lead));const details=document.createElement('details');details.className='assistant-more';const summary=document.createElement('summary');summary.textContent='More detail';const full=document.createElement('div');full.className='assistant-more-copy';full.textContent=text;details.append(summary,full);container.append(details);return;}
    const linkPattern=/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g;let last=0,match;
    while((match=linkPattern.exec(text))){container.append(document.createTextNode(text.slice(last,match.index)));const a=document.createElement('a');a.href=match[2];a.textContent=match[1];a.target='_blank';a.rel='noopener';container.append(a);last=linkPattern.lastIndex;}
    container.append(document.createTextNode(text.slice(last)));
  };
  if (document.querySelector('[data-assistant]')) {
    const launcher=document.createElement('button');launcher.className='assistant-launch';launcher.type='button';launcher.textContent='KBS quick answers';launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-controls','assistantPanel');
    const panel=document.createElement('section');panel.className='assistant-panel';panel.id='assistantPanel';panel.hidden=true;panel.setAttribute('aria-label','Offline KBS question assistant');
    panel.innerHTML='<div class="assistant-head"><div><strong>KBS Quick Answers</strong><small>Offline · answers use KBS information</small></div><button type="button" aria-label="Close assistant">×</button></div><div class="assistant-messages" aria-live="polite"><div class="assistant-reply"><strong>Hello!</strong><ul><li>Crane sales, rental and refurbishment</li><li>Parking, access and site security</li><li>Service and support</li></ul></div></div><form class="assistant-form"><input aria-label="Your question" placeholder="Ask a question…" autocomplete="off" required><button>Send</button></form>';
    document.body.append(launcher,panel);const messages=panel.querySelector('.assistant-messages'),input=panel.querySelector('input');
    const toggle=()=>{panel.hidden=!panel.hidden;launcher.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)input.focus();};launcher.addEventListener('click',toggle);panel.querySelector('.assistant-head button').addEventListener('click',toggle);
    const stopWords = new Set(['the','a','an','is','are','do','does','can','i','we','you','my','our','your','for','to','in','on','of','and','or','what','which','when','where','how','should','would','could','will','with','me','it','this','that','be','have','has','get','from','by','about','please','tell','need']);
    const synonymSets = [['cost','price','expensive','estimate','quotation','quote','pricing'],['repair','service','maintenance','servicing'],['location','located','locate','situated','area','coverage','operate','based'],['crane','hoist','lifting'],['automate','automation','automated'],['entry','access','entrance']];
    const normalize = value => {
      let s=value.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
      synonymSets.forEach(group=>{const re=new RegExp('\\b('+group.join('|')+')\\b','g');s=s.replace(re,group[0]);});
      return s;
    };
    const terms = value => new Set(normalize(value).split(/\s+/).filter(t=>t.length>1&&!stopWords.has(t)));
    const matchQuestion = query => {
      const q=normalize(query), qt=terms(query); let best=null,bestScore=0;
      knowledge.forEach(item=>{
        const candidates=[item.q,...(item.aliases||[])];let score=0;
        candidates.forEach(candidate=>{
          const c=normalize(candidate),ct=terms(candidate);let overlap=0;qt.forEach(t=>{if(ct.has(t))overlap++;});
          const coverage=overlap/Math.max(1,qt.size),precision=overlap/Math.max(1,ct.size);
          const exact=q===c?2:0,phrase=q.length>5&&c.includes(q)?1.15:0;
          score=Math.max(score,coverage*.62+precision*.30+exact+phrase);
        });
        if(score>bestScore){best=item;bestScore=score;}
      });
      return bestScore>=.30?best:null;
    };
    panel.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim();if(!text)return;const user=document.createElement('p');user.className='user-msg';user.textContent=text;messages.append(user);const clean=text.replace(/^(?:(?:hi|hello|hey|hii|good morning|good afternoon|good evening)\b[\s,!.]*)+/i,'').trim();const greeting=knowledge.find(item=>item.category==='Quick help'&&item.q.startsWith('Hi'));const chosen=clean?matchQuestion(clean):greeting;const reply=document.createElement('div');reply.className='assistant-reply';addAnswer(reply,chosen?chosen.a:'I couldn’t find a confident match in KBS’s offline information. Try asking about a product, service, site requirement, quotation or support. For a direct answer, call +91 89215 27981 or email info@kbsindustrial.com.');messages.append(reply);input.value='';messages.scrollTop=messages.scrollHeight;});
  }

  const faqMount=document.querySelector('[data-faq-list]');
  if(faqMount){
    const all=[...knowledge],categories=[...new Set(all.map(item=>item.category))],controls=document.querySelector('[data-faq-categories]'),search=document.querySelector('[data-faq-search]'),count=document.querySelector('[data-faq-count]');let selected='All';
    const button=(label)=>{const b=document.createElement('button');b.type='button';b.className='faq-filter'+(label===selected?' active':'');b.textContent=label;b.addEventListener('click',()=>{selected=label;controls.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderFaq();});controls.append(b);};button('All');categories.forEach(button);
    function renderFaq(){const query=(search.value||'').trim().toLowerCase();faqMount.replaceChildren();let found=0;all.forEach(item=>{if(selected!=='All'&&item.category!==selected)return;if(query&&!`${item.category} ${item.q} ${(item.aliases||[]).join(' ')} ${item.a}`.toLowerCase().includes(query))return;const details=document.createElement('details');details.className='faq-item';const summary=document.createElement('summary');summary.textContent=item.q;const answer=document.createElement('div');answer.className='faq-answer';addAnswer(answer,item.a);details.append(summary,answer);faqMount.append(details);found++;});count.textContent=`${found} answer${found===1?'':'s'}`;if(!found){const p=document.createElement('p');p.className='faq-empty';p.textContent='No matches yet. Try another phrase, or ask KBS directly using the contact details below.';faqMount.append(p);}}
    search.addEventListener('input',renderFaq);renderFaq();
  }

  const planner=document.querySelector('[data-project-planner]');
  if(planner){const requested=new URLSearchParams(location.search).get('need');planner.querySelectorAll('input[name="need"]').forEach(input=>{if(input.value===requested)input.checked=true;});planner.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(planner);const summary=`Hello KBS, I would like to discuss a project.\n\nFacility: ${d.get('facility')}\nMain requirement: ${d.get('need')}\nProject stage: ${d.get('stage')}\nSite location: ${d.get('location')||'Not provided'}\nKey details or constraints: ${d.get('details')||'Not provided'}\n\nPlease let me know what information you need next.`;const out=document.querySelector('[data-brief-output]');out.hidden=false;out.querySelector('[data-brief-text]').textContent=summary;out.querySelector('[data-brief-whatsapp]').href=`https://wa.me/918921527981?text=${encodeURIComponent(summary)}`;out.querySelector('[data-brief-email]').href=`mailto:info@kbsindustrial.com?subject=${encodeURIComponent('Project enquiry for KBS')}&body=${encodeURIComponent(summary)}`;out.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});});}

  const contactForm=document.querySelector('[data-contact-form]');
  contactForm?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(contactForm);const subject=encodeURIComponent('Website enquiry — '+d.get('name'));const body=encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\nPhone: ${d.get('phone')}\nInterest: ${d.get('interest')}\n\nProject details:\n${d.get('message')}`);location.href=`mailto:info@kbsindustrial.com?subject=${subject}&body=${body}`;});
})();



