(() => {
  const paths = {
    cranes: {
      label: 'Cranes',
      description: 'Choose whether you want to buy, rent or refurbish lifting equipment.',
      options: [
        {label:'Buy', need:'Crane sales or supply', title:'Crane sales & supply', intro:'Explore a crane for your site and operating needs.', bullets:['Load, span and lift height','Site layout or drawings']},
        {label:'Rent', need:'Equipment rental', title:'Crane rental', intro:'Ask about equipment for a temporary or project-based need.', bullets:['Location and rental dates','Capacity, access and operating conditions']},
        {label:'Refurbish', need:'Crane refurbishment or modernisation', title:'Refurbishment & modernisation', intro:'Review an existing crane and discuss repair or upgrade options.', bullets:['Make, model and equipment age','Photos, service history and known issues']}
      ]
    },
    parking: {
      label:'Parking & Access', description:'Choose the site flow you want to manage.', options:[
        {label:'Parking systems',need:'Parking solution',title:'Parking solutions',intro:'Discuss how vehicles enter, exit and move through your parking area.',bullets:['Number of lanes and peak traffic','Existing barriers or payment system']},
        {label:'Access control',need:'Access control',title:'Access control',intro:'Plan how people or vehicles enter designated areas.',bullets:['Doors, gates and user groups','Visitor and reporting requirements']}
      ]
    },
    security: {
      label:'Site Security',description:'Choose the type of vehicle protection you need.',options:[
        {label:'Bollards',need:'Bollards or road blockers',title:'Bollards',intro:'Review fixed, removable or automatic bollard requirements.',bullets:['Entry layout and traffic','Foundation depth and utilities']},
        {label:'Road blockers',need:'Bollards or road blockers',title:'Road blockers',intro:'Discuss controlled vehicle approach points for your facility.',bullets:['Lane width and operating frequency','Site access and safety requirements']}
      ]
    },
    support: {
      label:'Service & Automation',description:'Choose the support or system change you want to discuss.',options:[
        {label:'Maintenance & repair',need:'Maintenance or servicing',title:'Maintenance & repair',intro:'Start with the equipment and what needs attention.',bullets:['Make, model and service history','Issue, fault code or preferred timing']},
        {label:'Electrical & automation',need:'Electrical controls or automation',title:'Electrical & automation',intro:'Describe the machinery and the outcome you want to achieve.',bullets:['Existing controls or wiring information','Process, equipment and desired change']}
      ]
    }
  };
  window.KBS_EXPLORER = paths;
  document.querySelectorAll('[data-system-explorer]').forEach(root => {
    const tabs=root.querySelector('[data-explorer-tabs]'), picks=root.querySelector('[data-explorer-picks]');
    const title=root.querySelector('[data-explorer-title]'), tag=root.querySelector('[data-explorer-tag]'), desc=root.querySelector('[data-explorer-description]');
    const bullets=root.querySelector('[data-explorer-bullets]'), link=root.querySelector('[data-explorer-planner]'), number=root.querySelector('[data-explorer-number]');
    if(!tabs||!picks||!title||!link)return;
    const keys=Object.keys(paths);let activeKey='cranes',activeNeed='';
    const showOption=(key,index)=>{
      const group=paths[key], item=group.options[index];activeKey=key;activeNeed=item.need;
      title.textContent=item.title;tag.textContent=group.label+' / '+item.label;desc.textContent=item.intro;
      bullets.replaceChildren(...item.bullets.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
      link.href='planner.html?need='+encodeURIComponent(item.need);link.textContent='Prepare a project brief ↗';
      number.textContent=String(keys.indexOf(key)+1).padStart(2,'0')+' / '+String(keys.length).padStart(2,'0');
      picks.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index));});
      tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.path===key));
    };
    const showCategory=key=>{
      const group=paths[key];tabs.querySelectorAll('button').forEach(b=>{const selected=b.dataset.path===key;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
      picks.replaceChildren(...group.options.map((option,index)=>{const b=document.createElement('button');b.type='button';b.className='explorer-pick';b.textContent=option.label;b.addEventListener('click',()=>showOption(key,index));return b;}));
      showOption(key,0);
    };
    tabs.replaceChildren(...keys.map(key=>{const b=document.createElement('button');b.type='button';b.className='explorer-tab';b.dataset.path=key;b.textContent=paths[key].label;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>showCategory(key));return b;}));
    showCategory(activeKey);
  });
})();
