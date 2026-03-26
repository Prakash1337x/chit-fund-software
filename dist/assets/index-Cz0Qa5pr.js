(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function s(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(r){if(r.ep)return;r.ep=!0;const n=s(r);fetch(r.href,n)}})();const e={settings:JSON.parse(localStorage.getItem("sc_settings"))||{name:"Sivam Crackers",logo:"SC",location:"Sivakasi, TN",phone:"9876543210",address:"No. 42, Sivakasi Main Road, Sivakasi - 626123",bannerImages:[]},groups:JSON.parse(localStorage.getItem("sc_groups"))||[],members:JSON.parse(localStorage.getItem("sc_members"))||[],payments:JSON.parse(localStorage.getItem("sc_payments"))||[],auctions:JSON.parse(localStorage.getItem("sc_auctions"))||[],save(){localStorage.setItem("sc_settings",JSON.stringify(this.settings)),localStorage.setItem("sc_groups",JSON.stringify(this.groups)),localStorage.setItem("sc_members",JSON.stringify(this.members)),localStorage.setItem("sc_payments",JSON.stringify(this.payments)),localStorage.setItem("sc_auctions",JSON.stringify(this.auctions))},addGroup(t){this.groups.push({...t,id:Date.now().toString()}),this.save()},addMember(t){this.members.push({...t,id:Date.now().toString(),joinedAt:new Date().toISOString()}),this.save()},recordPayment(t){this.payments.push({...t,id:Date.now().toString(),date:new Date().toISOString()}),this.save()},addAuction(t){this.auctions.push({...t,id:Date.now().toString(),date:new Date().toISOString()}),this.save()},updateSettings(t){this.settings={...this.settings,...t},this.save()},calculateTotalCollection(){return this.payments.reduce((t,a)=>t+Number(a.amount),0)},getMemberPayments(t){return this.payments.filter(a=>a.memberId===t)},getGroupMembers(t){return this.members.filter(a=>a.groupId===t)}};function d(){const t=[],a=(s,i)=>t.push({msg:s,pass:i});try{a("Store object initialized",!!e);const s=e.calculateTotalCollection();e.payments.push({amount:10,memberId:"tmp",groupId:"tmp"});const i=e.calculateTotalCollection();a("Collection calculation integrity",i===s+10),e.payments.pop();const r={id:"test-qa",name:"QA Group"};e.groups.push(r),e.members.push({name:"QA Member",groupId:"test-qa"}),a("Group-Member relational mapping",e.getGroupMembers("test-qa").length===1),e.groups.pop(),e.members.pop();const n=e.auctions.length;return e.addAuction({groupId:"tmp",winnerId:"tmp",bidAmount:500}),a("Auction recording integrity",e.auctions.length===n+1),e.auctions.pop(),t}catch(s){return console.error(s),[{msg:"Critical Test Failure: "+s.message,pass:!1}]}}const l={activePage:"dashboard",init(){this.handleRouting(),window.addEventListener("hashchange",()=>this.handleRouting()),document.addEventListener("submit",t=>{t.target.id==="settings-form"&&this.handleSettingsSubmit(t),t.target.id==="group-form"&&this.handleGroupSubmit(t),t.target.id==="member-form"&&this.handleMemberSubmit(t),t.target.id==="payment-form"&&this.handlePaymentSubmit(t),t.target.id==="auction-form"&&this.handleAuctionSubmit(t)})},handleRouting(){const t=window.location.hash.replace("#/","")||"dashboard";this.activePage=t,this.render()},handleSettingsSubmit(t){t.preventDefault();const a=new FormData(t.target),s=Object.fromEntries(a.entries());e.updateSettings(s),alert("Settings saved!"),this.render()},handleGroupSubmit(t){t.preventDefault();const a=new FormData(t.target),s=Object.fromEntries(a.entries());e.addGroup(s),t.target.reset(),this.render()},handleMemberSubmit(t){t.preventDefault();const a=new FormData(t.target),s=Object.fromEntries(a.entries());e.addMember(s),t.target.reset(),this.render()},handlePaymentSubmit(t){t.preventDefault();const a=new FormData(t.target),s=Object.fromEntries(a.entries());e.recordPayment(s),t.target.reset(),this.render()},handleAuctionSubmit(t){t.preventDefault();const a=new FormData(t.target),s=Object.fromEntries(a.entries());e.addAuction(s),t.target.reset(),this.render()},render(){const t=document.getElementById("app");t.innerHTML=`
      <aside class="sidebar">
        <div class="logo-container">
          <div class="logo-icon">${e.settings.logo||"SC"}</div>
          <div class="logo-text">
            <h1>${e.settings.name||"Sivam Crackers"}</h1>
            <p>${e.settings.location||"Sivakasi, TN"}</p>
          </div>
        </div>
        <nav class="nav-menu">
          <ul class="nav-list">
            ${this.renderNavItem("Dashboard","dashboard","📊")}
            ${this.renderNavItem("Groups","groups","📁")}
            ${this.renderNavItem("Members","members","👥")}
            ${this.renderNavItem("Payments","payments","💰")}
            ${this.renderNavItem("Auctions","auctions","🔨")}
            ${this.renderNavItem("Reports","reports","📄")}
            ${this.renderNavItem("Settings","settings","⚙️")}
          </ul>
        </nav>
      </aside>
      <main class="main-content">
        <header class="header">
          <h2>${this.getPageTitle()}</h2>
          <div class="user-profile">
            <span>Admin Control Panel</span>
          </div>
        </header>
        <div id="page-content">
          ${this.renderPage()}
        </div>
      </main>
    `},renderNavItem(t,a,s){const i=this.activePage===a?"active":"";return`
      <li class="nav-item">
        <a href="#/${a}" class="nav-link ${i}">
          <span class="icon">${s}</span>
          ${t}
        </a>
      </li>
    `},getPageTitle(){return{dashboard:"Dashboard Overview",groups:"Chit Group Management",members:"Customer & Member Database",payments:"Collection & Installments",auctions:"Auction & Winning Bids",reports:"Financial Reports",settings:"Framework Settings"}[this.activePage]||"Dashboard"},renderPage(){switch(this.activePage){case"dashboard":return this.pages.dashboard();case"groups":return this.pages.groups();case"members":return this.pages.members();case"payments":return this.pages.payments();case"auctions":return this.pages.auctions();case"settings":return this.pages.settings();case"reports":return this.pages.reports();default:return this.pages.dashboard()}},pages:{dashboard(){var a;return`
        <div class="card carousel" style="background-image: url('${e.settings.bannerImages&&e.settings.bannerImages.length>0?e.settings.bannerImages[0]:"https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1200&q=80"}'); height: 200px; background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 1.5rem; color: white;">
          <h2 style="font-size: 2rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5)">${e.settings.name} Chit Fund</h2>
        </div>
        <div class="grid">
          <div class="card">
            <h3>Total Collection</h3>
            <p class="stat">₹ ${e.calculateTotalCollection()}</p>
          </div>
          <div class="card">
            <h3>Active Groups</h3>
            <p class="stat">${e.groups.length}</p>
          </div>
          <div class="card">
            <h3>Total Members</h3>
            <p class="stat">${e.members.length}</p>
          </div>
          <div class="card">
            <h3>Latest Auction Winner</h3>
            <p class="stat" style="font-size: 1.2rem;">
              ${e.auctions.length>0?((a=e.members.find(s=>s.id===e.auctions[e.auctions.length-1].winnerId))==null?void 0:a.name)||"Unknown":"No Auctions Yet"}
            </p>
          </div>
        </div>
        
        <div class="card" style="margin-top: 2rem;">
          <h3>Recent Payments</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Group</th>
                </tr>
              </thead>
              <tbody>
                ${e.payments.slice(-5).reverse().map(s=>{const i=e.members.find(n=>n.id===s.memberId),r=e.groups.find(n=>n.id===s.groupId);return`
                    <tr>
                      <td>${new Date(s.date).toLocaleDateString()}</td>
                      <td>${i?i.name:"Unknown"}</td>
                      <td>₹ ${s.amount}</td>
                      <td>${r?r.name:"N/A"}</td>
                    </tr>
                  `}).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `},groups(){return`
        <div class="grid">
          <div class="card">
            <h3>Create New Group</h3>
            <form id="group-form">
              <div class="form-group">
                <label>Group Name</label>
                <input type="text" name="name" required placeholder="e.g. Diwali Special 2026">
              </div>
              <div class="form-group" style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label>Total Value</label>
                  <input type="number" name="totalValue" required>
                </div>
                <div>
                  <label>Monthly Installment</label>
                  <input type="number" name="installment" required>
                </div>
              </div>
              <button type="submit" class="primary">Add Group</button>
            </form>
          </div>
          <div class="card">
            <h3>Active Groups</h3>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Installment</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${e.groups.map(t=>`
                    <tr>
                      <td>${t.name}</td>
                      <td>₹ ${t.installment}</td>
                      <td>₹ ${t.totalValue}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `},members(){return`
        <div class="grid" style="grid-template-columns: 1fr 2fr;">
          <div class="card">
            <h3>Add New Member</h3>
            <form id="member-form">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="name" required>
              </div>
              <div class="form-group">
                <label>Phone / WhatsApp</label>
                <input type="tel" name="phone" required>
              </div>
              <div class="form-group">
                <label>Assign to Group</label>
                <select name="groupId" required>
                  <option value="">Select Group</option>
                  ${e.groups.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}
                </select>
              </div>
              <button type="submit" class="primary">Register Member</button>
            </form>
          </div>
          <div class="card">
            <h3>Member Database</h3>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Group</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${e.members.map(t=>{const a=e.groups.find(s=>s.id===t.groupId);return`
                      <tr>
                        <td>${t.name}</td>
                        <td>${t.phone}</td>
                        <td>${a?a.name:"Unassigned"}</td>
                        <td><span style="color: var(--accent);">Active</span></td>
                      </tr>
                    `}).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `},payments(){return`
        <div class="card">
          <h3>Record Monthly Payment</h3>
          <form id="payment-form" style="display: grid; grid-template-columns: repeat(3, 1fr) auto; gap: 1rem; align-items: end;">
            <div class="form-group">
              <label>Select Member</label>
              <select name="memberId" required>
                <option value="">Choose Member</option>
                ${e.members.map(t=>`<option value="${t.id}">${t.name} (${t.phone})</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>Amount Paid</label>
              <input type="number" name="amount" required>
            </div>
            <div class="form-group">
              <label>Group ID (Auto)</label>
              <input type="text" name="groupId" placeholder="Auto-filled via member selection" readonly>
            </div>
            <button type="submit" class="primary" style="margin-bottom: 24px;">Record</button>
          </form>
        </div>
      `},auctions(){return`
        <div class="grid">
          <div class="card">
            <h3>Record New Auction</h3>
            <form id="auction-form">
              <div class="form-group">
                <label>Select Group</label>
                <select name="groupId" required>
                  <option value="">Choose Group</option>
                  ${e.groups.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label>Winning Member</label>
                <select name="winnerId" required>
                  <option value="">Choose Winner</option>
                  ${e.members.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label>Winning Bid Amount</label>
                <input type="number" name="bidAmount" required>
              </div>
              <button type="submit" class="primary">Record Auction</button>
            </form>
          </div>
          <div class="card">
            <h3>Auction History</h3>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Group</th>
                    <th>Winner</th>
                    <th>Bid Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${e.auctions.map(t=>{const a=e.groups.find(i=>i.id===t.groupId),s=e.members.find(i=>i.id===t.winnerId);return`
                      <tr>
                        <td>${new Date(t.date).toLocaleDateString()}</td>
                        <td>${a?a.name:"N/A"}</td>
                        <td>${s?s.name:"Unknown"}</td>
                        <td>₹ ${t.bidAmount}</td>
                      </tr>
                    `}).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `},settings(){return`
        <div class="grid">
          <div class="card">
            <h3>Business Identity</h3>
            <form id="settings-form">
              <div class="form-group">
                <label>Business Name</label>
                <input type="text" name="name" value="${e.settings.name}">
              </div>
              <div class="form-group">
                <label>Logo / Brand Mark (Max 2 Chars)</label>
                <input type="text" name="logo" value="${e.settings.logo}">
              </div>
               <div class="form-group">
                <label>Tagline / Location</label>
                <input type="text" name="location" value="${e.settings.location}">
              </div>
              <div class="form-group">
                <label>Full Address</label>
                <textarea name="address" rows="3">${e.settings.address}</textarea>
              </div>
              <div class="form-group">
                <label>Contact Number (WhatsApp)</label>
                <input type="tel" name="phone" value="${e.settings.phone}">
              </div>
              <button type="submit" class="primary">Update Framework</button>
            </form>
          </div>
          <div class="card" id="banner-settings">
            <h3>Carousel Banner Settings</h3>
            <p style="color: var(--text-muted); margin-bottom: 1rem;">Manage homepage slide banners.</p>
            <!-- In a real app, this would be an image upload. Here we simulate URLs. -->
            <div class="form-group">
              <label>Slide Image URL</label>
              <input type="url" placeholder="https://example.com/slide1.jpg">
            </div>
            <button class="primary" style="background: var(--secondary)">Add to Carousel</button>
          </div>
        </div>
      `},reports(){const t=e.groups.map(a=>{const s=e.getGroupMembers(a.id),i=e.payments.filter(r=>r.groupId===a.id).reduce((r,n)=>r+Number(n.amount),0);return{name:a.name,membersCount:s.length,totalCollected:i}});return window.downloadCSV=()=>{const a=[["Group Name","Members","Total Collected"]];t.forEach(n=>a.push([n.name,n.membersCount,n.totalCollected]));const s="data:text/csv;charset=utf-8,"+a.map(n=>n.join(",")).join(`
`),i=encodeURI(s),r=document.createElement("a");r.setAttribute("href",i),r.setAttribute("download","chit_fund_report.csv"),document.body.appendChild(r),r.click()},`
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3>Monthly Collection Report</h3>
            <button onclick="downloadCSV()" class="primary" style="background: var(--accent)">Download CSV Report</button>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Members</th>
                  <th>Total Collected</th>
                </tr>
              </thead>
              <tbody>
                ${t.map(a=>`
                  <tr>
                    <td>${a.name}</td>
                    <td>${a.membersCount}</td>
                    <td>₹ ${a.totalCollected}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card" style="margin-top: 2rem;">
          <h3>Auction Dividend Summary</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Total Bids</th>
                  <th>Total Auctions</th>
                </tr>
              </thead>
              <tbody>
                ${e.groups.map(a=>{const s=e.auctions.filter(r=>r.groupId===a.id),i=s.reduce((r,n)=>r+Number(n.bidAmount),0);return`
                    <tr>
                      <td>${a.name}</td>
                      <td>₹ ${i}</td>
                      <td>${s.length}</td>
                    </tr>
                  `}).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card" style="margin-top: 2rem; border: 1px dashed var(--primary); text-align: center;">
          <h3>Quality Assurance</h3>
          <p>Run automated integrity checks on financial data.</p>
          <div id="test-results" style="margin-top: 1rem; text-align: left; max-width: 400px; margin-inline: auto;"></div>
          <button id="run-tests-btn" class="primary" style="margin-top: 1rem;">Execute Auto Diagnostic</button>
        </div>
      `}}};document.addEventListener("click",t=>{if(t.target.id==="run-tests-btn"){const a=d(),s=document.getElementById("test-results");s.innerHTML=`
      <ul style="list-style: none; padding: 0;">
        ${a.map(i=>`
          <li style="padding: 0.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
            <span>${i.msg}</span>
            <span>${i.pass?"✅":"❌"}</span>
          </li>
        `).join("")}
      </ul>
    `,t.target.textContent="Re-Run Diagnostic"}});l.init();
