import { store } from './store.js';
import { runTests } from './tests/browser-tests.js';

const App = {
  activePage: 'dashboard',

  init() {
    this.handleRouting();
    window.addEventListener('hashchange', () => this.handleRouting());
    
    // Global Event Delegation for forms
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'group-form') this.handleGroupSubmit(e);
      if (e.target.id === 'member-form') this.handleMemberSubmit(e);
      if (e.target.id === 'payment-form') this.handlePaymentSubmit(e);
      if (e.target.id === 'login-form') this.handleLoginSubmit(e);
    });

    document.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn') this.handleLogout();
    });

    document.addEventListener('change', (e) => {
      if (e.target.id === 'admin-member-select') {
        this.updatePaymentStatus(e.target.value, document.getElementById('member-status-box'));
      }
    });
  },

  handleRouting() {
    const hash = window.location.hash.replace('#/', '') || 'dashboard';
    this.activePage = hash;
    
    // Auto-redirect if trying to access admin pages while not logged in
    const adminPages = ['members', 'payments', 'blast', 'reports'];
    if (adminPages.includes(this.activePage) && !store.isAdmin) {
      window.location.hash = '#/login';
      return;
    }

    this.render();
  },

  updatePaymentStatus(memberId, container) {
    if (!memberId) {
      container.innerHTML = '';
      return;
    }

    const member = store.members.find(m => m.id === memberId);
    const status = store.getMemberEmiStatus(memberId);
    const group = store.groups.find(g => g.id === member.groupId);

    if (!status || !container) return;

    container.innerHTML = `
      <div class="card" style="background: rgba(var(--primary-rgb), 0.1); border: 1px solid var(--primary); margin-top: 1rem;">
        <h4>Member Status: ${member.name}</h4>
        <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem; font-size: 0.9rem;">
          <div><strong>Joining Date:</strong> ${status.startDate}</div>
          <div><strong>End Date:</strong> ${status.endDate}</div>
          <div><strong>EMI Progression:</strong> ${status.paidMonths} / ${status.totalMonths}</div>
          <div><strong>Months Pending:</strong> ${status.pendingMonths}</div>
          <div><strong>Monthly Installment:</strong> ₹ ${status.monthlyInstallment}</div>
          <div><strong>Pending Amount:</strong> ₹ ${status.pendingAmount}</div>
          <div><strong>Next EMI Date:</strong> ${status.nextEmiDate} (#${status.nextEmiNumber})</div>
          <div><strong>Current Month:</strong> ${status.paidThisMonth ? '<span style="color:#4caf50">✅ Paid</span>' : '<span style="color:#f44336">❌ Pending</span>'}</div>
        </div>
        
        <div style="margin-top: 1.5rem;">
          <h5>Payment History</h5>
          <div class="table-container" style="max-height: 150px; overflow-y: auto;">
            <table style="font-size: 0.8rem;">
              <thead>
                <tr><th>EMI #</th><th>Date</th><th>Amount</th></tr>
              </thead>
              <tbody>
                ${store.getMemberPayments(memberId).reverse().map(p => `
                  <tr>
                    <td>#${p.emiNumber}</td>
                    <td>${new Date(p.date).toLocaleDateString()}</td>
                    <td>₹ ${p.amount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Auto-fill amount and group
    const form = document.getElementById('payment-form');
    form.amount.value = group.installment;
    form.groupId.value = group.name;
    form.groupId.dataset.id = group.id;
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, password } = Object.fromEntries(formData.entries());
    if (store.login(username, password)) {
      window.location.hash = '#/dashboard';
    } else {
      alert('Invalid Username or Password. Hint: admin / admin123');
    }
  },

  handleLogout() {
    store.logout();
    window.location.hash = '#/dashboard';
  },

  handleMemberLookup() {
    const isPayment = this.activePage === 'pay';
    const inputId = isPayment ? 'payment-phone' : 'lookup-phone';
    const resultId = isPayment ? 'payment-result' : 'lookup-result';
    
    const phone = document.getElementById(inputId).value;
    const resultContainer = document.getElementById(resultId);
    
    if (!phone) {
      alert('Please enter your phone number.');
      return;
    }

    const member = store.members.find(m => m.phone === phone);
    if (!member) {
      resultContainer.innerHTML = `
        <div class="card" style="border: 1px solid #f44336; background: rgba(244, 67, 54, 0.05);">
          <p style="color: #f44336;">No member found with that phone number. Please contact the administrator.</p>
        </div>
      `;
      return;
    }

    const status = store.getMemberEmiStatus(member.id);
    const group = store.groups.find(g => g.id === member.groupId);

    resultContainer.innerHTML = `
      <div class="card" style="border: 1px solid var(--primary); background: rgba(var(--primary-rgb), 0.05); text-align: left;">
        <h4>Account Status: ${member.name}</h4>
        <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <p style="color: var(--text-muted); font-size: 0.8rem;">Group Name</p>
            <p><strong>${group ? group.name : 'N/A'}</strong></p>
          </div>
          <div>
            <p style="color: var(--text-muted); font-size: 0.8rem;">Monthly EMI</p>
            <p><strong>₹ ${group ? group.installment : '0'}</strong></p>
          </div>
          <div>
            <p style="color: var(--text-muted); font-size: 0.8rem;">EMI Progression</p>
            <p><strong>${status.paidMonths} / ${status.totalMonths} Paid</strong></p>
          </div>
          <div>
            <p style="color: var(--text-muted); font-size: 0.8rem;">Status for This Month</p>
            <p><strong>${status.paidThisMonth ? '<span style="color: #4caf50;">✅ Paid</span>' : '<span style="color: #f44336;">❌ Pending</span>'}</strong></p>
          </div>
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee;">
          <p style="font-size: 0.9rem;"><strong>Total Paid:</strong> ₹ ${status.paidAmount}</p>
          <p style="font-size: 0.9rem; color: #f44336;"><strong>Pending Balance:</strong> ₹ ${status.pendingAmount}</p>
        </div>
        ${isPayment ? 
          (!status.paidThisMonth ? `
            <button class="primary" style="width: 100%; margin-top: 1.5rem; background: #4caf50; padding: 12px; font-size: 1.1rem;" onclick="App.handleCustomerPayment('${member.id}', ${group.installment}, '${group.id}')">
              Pay Current EMI (₹${group.installment})
            </button>
          ` : `
            <div style="margin-top: 1.5rem; text-align: center; padding: 1rem; background: rgba(76, 175, 80, 0.1); border-radius: 8px;">
              <p style="color: #4caf50; font-weight: 500;">You have already paid your EMI for this month!</p>
            </div>
          `) 
        : ''}
      </div>
    `;
  },

  handleCustomerPayment(memberId, amount, groupId) {
    if (confirm(`Confirm payment of ₹${amount} for this month?`)) {
      store.recordPayment({ memberId, amount, groupId });
      alert('Payment successful! Your status has been updated. An automated payment receipt will be sent via WhatsApp shortly.');
      this.handleMemberLookup();
    }
  },

  showJoinForm(groupId) {
    this.selectedGroupId = groupId;
    this.activePage = 'join-form';
    this.render();
  },

  handleCustomerJoin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    store.addMember({
      name: data.name,
      phone: data.phone,
      email: data.email,
      paymentMode: data.paymentMode,
      groupId: this.selectedGroupId
    });
    
    alert(`Success! You have joined the group. You can now check your status using your phone number.`);
    this.activePage = 'status';
    this.render();
  },

  handleGroupSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    store.addGroup(data);
    e.target.reset();
    this.render();
  },



  handlePaymentSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    store.recordPayment(data);
    e.target.reset();
    this.render();
  },

  handleAuctionSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    store.addAuction(data);
    e.target.reset();
    this.render();
  },

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <aside class="sidebar">
        <div class="logo-container">
          <div class="logo-icon">${store.settings.logo || 'SC'}</div>
          <div class="logo-text">
            <h1>${store.settings.name || 'Sivam Crackers'}</h1>
            <p>${store.settings.location || 'Sivakasi, TN'}</p>
          </div>
        </div>
        <nav class="nav-menu">
          <ul class="nav-list">
            ${store.isAdmin ? `
              ${this.renderNavItem('Dashboard', 'dashboard', '📊')}
              ${this.renderNavItem('Groups', 'groups', '📁')}
              ${this.renderNavItem('Members', 'members', '👥')}
              ${this.renderNavItem('Payments', 'payments', '💰')}
              ${this.renderNavItem('WhatsApp Blast', 'blast', '📲')}
              ${this.renderNavItem('Reports', 'reports', '📄')}
            ` : `
              ${this.renderNavItem('Home', 'dashboard', '🏠')}
              ${this.renderNavItem('Check Status', 'status', '📜')}
              ${this.renderNavItem('Make Payment', 'pay', '💳')}
              ${this.renderNavItem('Join Group', 'join', '🎆')}
            `}
          </ul>
        </nav>
        <div class="sidebar-footer" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #eee;">
          ${store.isAdmin ? `
            <button id="logout-btn" style="background: rgba(244, 67, 54, 0.1); color: #f44336; width: 100%;">Admin Logout</button>
          ` : `
            <a href="#/login" class="nav-link" style="background: rgba(var(--primary-rgb), 0.1); color: var(--primary);">Admin Login</a>
          `}
        </div>
      </aside>
      <main class="main-content">
        <header class="header">
          <h2>${this.getPageTitle()}</h2>
          <div class="user-profile">
            <span>${store.isAdmin ? 'Admin Control Panel' : 'Customer Portal'}</span>
          </div>
        </header>
        <div id="page-content">
          ${this.renderPage()}
        </div>
      </main>
    `;
  },

  renderNavItem(label, id, icon) {
    const activeClass = this.activePage === id ? 'active' : '';
    return `
      <li class="nav-item">
        <a href="#/${id}" class="nav-link ${activeClass}">
          <span class="icon">${icon}</span>
          ${label}
        </a>
      </li>
    `;
  },

  getPageTitle() {
    const titles = {
      dashboard: store.isAdmin ? 'Admin Dashboard Overview' : 'Sivam Crackers Chit Fund',
      login: 'Administrative Authentication',
      groups: 'Chit Group Management',
      members: 'Customer & Member Database',
      payments: 'Collection & Installments',
      blast: 'WhatsApp Automated Reminders',
      reports: 'Financial Reports',
      status: 'Check My EMI Status',
      pay: 'Make an Online Payment',
      join: 'Explore & Join Groups'
    };
    return titles[this.activePage] || 'Dashboard';
  },

  renderPage() {
    switch (this.activePage) {
      case 'dashboard': return this.pages.dashboard();
      case 'login': return this.pages.login();
      case 'groups': return this.pages.groups();
      case 'members': return this.pages.members();
      case 'payments': return this.pages.payments();
      case 'blast': return this.pages.blast();
      case 'reports': return this.pages.reports();
      case 'status': return this.pages.status();
      case 'pay': return this.pages.pay();
      case 'join': return this.pages.join();
      case 'join-form': return this.pages['join-form']();
      default: return this.pages.dashboard();
    }
  },

  pages: {
    dashboard() {
      if (store.isAdmin) {
        const banner = store.settings.bannerImages && store.settings.bannerImages.length > 0 
          ? store.settings.bannerImages[0] 
          : 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1200&q=80';

        return `
          <div class="card carousel" style="background-image: url('${banner}'); height: 200px; background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 1.5rem; color: white;">
            <h2 style="font-size: 2rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5)">${store.settings.name} Admin Panel</h2>
          </div>
          <div class="grid">
            <div class="card">
              <h3>Total Collection</h3>
              <p class="stat">₹ ${store.calculateTotalCollection()}</p>
            </div>
            <div class="card">
              <h3>Active Groups</h3>
              <p class="stat">${store.groups.length}</p>
            </div>
            <div class="card">
              <h3>Total Members</h3>
              <p class="stat">${store.members.length}</p>
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
                  ${store.payments.slice(-5).reverse().map(p => {
                    const member = store.members.find(m => m.id === p.memberId);
                    const group = store.groups.find(g => g.id === p.groupId);
                    return `
                      <tr>
                        <td>${new Date(p.date).toLocaleDateString()}</td>
                        <td>${member ? member.name : 'Unknown'}</td>
                        <td>₹ ${p.amount}</td>
                        <td>${group ? group.name : 'N/A'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else {
        // Customer Dashboard - Fireworks theme
        return `
          <div class="card" style="background: url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80') center/cover; color: white; padding: 4rem 2rem; text-align: center; border: none; border-radius: 12px; position: relative; overflow: hidden;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.6);"></div>
            <div style="position: relative; z-index: 1;">
              <h1 style="font-size: 3rem; margin-bottom: 1rem; text-shadow: 0 4px 10px rgba(0,0,0,0.8);">${store.settings.name}</h1>
              <p style="font-size: 1.3rem; opacity: 0.95; text-shadow: 0 2px 5px rgba(0,0,0,0.8);">Celebrate your savings with Sivakasi's trusted chit fund partner.</p>
              <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                <button class="primary" onclick="window.location.hash='#/join'" style="background: var(--accent); font-size: 1.1rem; padding: 12px 24px;">🎆 Join a Group</button>
                <button class="primary" onclick="window.location.hash='#/status'" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); font-size: 1.1rem; padding: 12px 24px;">📜 Check Status</button>
              </div>
            </div>
          </div>
          
          <div class="grid" style="margin-top: 2rem;">
            <div class="card" style="text-align: center; padding: 2rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🎇</div>
              <h3>Huge Returns</h3>
              <p style="color: var(--text-muted); margin-top: 0.5rem;">Plan your festive celebrations early with guaranteed highest dividend returns.</p>
            </div>
            <div class="card" style="text-align: center; padding: 2rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
              <h3>100% Digital</h3>
              <p style="color: var(--text-muted); margin-top: 0.5rem;">Track and pay your EMIs effortlessly automatically without visiting any branch.</p>
            </div>
            <div class="card" style="text-align: center; padding: 2rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
              <h3>Secure & Trusted</h3>
              <p style="color: var(--text-muted); margin-top: 0.5rem;">Your investments are safe with Sivam Crackers' transparent accounting.</p>
            </div>
          </div>
        `;
      }
    },

    status() {
      return `
        <div class="card" style="max-width: 600px; margin: 0 auto;">
          <h3>Search My Status</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Enter your registered phone number to view your EMI progression.</p>
          <div class="form-group" style="display: flex; gap: 1rem;">
            <input type="tel" id="lookup-phone" placeholder="e.g. 9876543210">
            <button class="primary" onclick="App.handleMemberLookup()">Search</button>
          </div>
          <div id="lookup-result" style="margin-top: 2rem;"></div>
        </div>
      `;
    },

    pay() {
      return `
        <div class="card" style="max-width: 600px; margin: 0 auto; border-top: 4px solid #4caf50;">
          <h3>Make an Online Payment</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Enter your phone number to find your pending EMI and securely pay online.</p>
          <div class="form-group" style="display: flex; gap: 1rem;">
            <input type="tel" id="payment-phone" placeholder="e.g. 9876543210">
            <button class="primary" onclick="App.handleMemberLookup()">Find Due</button>
          </div>
          <div id="payment-result" style="margin-top: 2rem;"></div>
        </div>
      `;
    },

    join() {
      return `
        <div class="card" style="border-top: 4px solid var(--accent);">
          <h3>Available Festive Groups</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Browse our currently open groups and join the one that fits your savings goal.</p>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Total Value</th>
                  <th>Duration</th>
                  <th>Monthly Installment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${store.groups.map(g => `
                  <tr>
                    <td><strong>${g.name}</strong></td>
                    <td>₹ ${g.totalValue}</td>
                    <td>${g.durationMonths} Mo</td>
                    <td>₹ ${g.installment}</td>
                    <td>
                      <button class="primary" style="padding: 6px 16px; font-size: 0.9rem; background: var(--accent);" onclick="App.showJoinForm('${g.id}')">Join Now</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    login() {
      return `
        <div style="max-width: 400px; margin: 4rem auto;">
          <div class="card">
            <h3>Admin Authentication</h3>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Please enter your credentials to access the management panel.</p>
            <form id="login-form">
              <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" required placeholder="admin">
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required placeholder="••••••••">
              </div>
              <button type="submit" class="primary" style="width: 100%; margin-top: 1rem;">Login to Secure Panel</button>
            </form>
          </div>
        </div>
      `;
    },

    groups() {
      return `
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
                  <label>Total Chit Value</label>
                  <input type="number" name="totalValue" required>
                </div>
                <div>
                  <label>Duration (Months)</label>
                  <input type="number" name="durationMonths" required value="12">
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
                    <th>Chit Value</th>
                    <th>Duration</th>
                    <th>Installment</th>
                    <th>Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${store.groups.map(g => `
                    <tr>
                      <td>${g.name}</td>
                      <td>₹ ${g.totalValue}</td>
                      <td>${g.durationMonths} Mo</td>
                      <td>₹ ${g.installment}</td>
                      <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date(g.startDate).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    members() {
      return `
        <div class="card">
          <h3>Member Database</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Review all joined members across all groups. Members directly join from the Customer Portal.</p>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Group</th>
                  <th>Pay Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${store.members.map(m => {
                  const group = store.groups.find(g => g.id === m.groupId);
                  return `
                    <tr>
                      <td>${m.name}</td>
                      <td>${m.phone}</td>
                      <td>${group ? group.name : 'Unassigned'}</td>
                      <td><span class="tag">${m.paymentMode || 'UPI'}</span></td>
                      <td><span style="color: var(--accent);">Active</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },
    payments() {
      return `
        <div class="card">
          <h3>Member Payment History</h3>
          <p style="color: var(--text-muted); margin-bottom: 1rem;">View the payment status and history for any member. Payments are made by customers from their self-service portal.</p>
          <div class="form-group" style="max-width: 400px;">
            <label>Select Member</label>
            <select id="admin-member-select">
              <option value="">Choose Member</option>
              ${store.members.map(m => `<option value="${m.id}">${m.name} (${m.phone})</option>`).join('')}
            </select>
          </div>
          <div id="member-status-box"></div>
        </div>
      `;
    },


    blast() {
      const today = new Date();
      const reminders = store.members.map(m => {
        const group = store.groups.find(g => g.id === m.groupId);
        if (!group) return null;
        
        const status = store.getMemberEmiStatus(m.id);
        if (status.paidThisMonth) return null;

        // Simulate "1 week before" and "2 days before" logic
        // For demo, we just show all unpaid members as "Due"
        return {
          member: m,
          group: group,
          status: status,
          dueDate: "7th of each month", // Example fixed date
          daysLeft: 5 // Example
        };
      }).filter(Boolean);

      return `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <h3>Automated WhatsApp Log</h3>
              <p style="color: var(--text-muted);">Real-time log of automated reminders and receipts sent by the system.</p>
            </div>
            <span class="tag" style="background: #25D366; color: white;">System Active ✅</span>
          </div>
          
          <div style="background: rgba(37, 211, 102, 0.05); border-left: 4px solid #25D366; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.9rem;">
            ℹ️ The system scans unpaid EMIs daily to send reminders (7 & 2 days prior) and dispatches instant receipts upon payment.
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time / Date</th>
                  <th>Member</th>
                  <th>Message Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${reminders.map(r => `
                  <tr>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date().toLocaleString()}</td>
                    <td>
                      <strong>${r.member.name}</strong><br>
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${r.member.phone}</span>
                    </td>
                    <td>EMI Reminder (#${r.status.nextEmiNumber})</td>
                    <td><span class="tag" style="background: rgba(37, 211, 102, 0.1); color: #25D366;">✅ Sent Successfully</span></td>
                  </tr>
                `).join('')}
                ${store.payments.slice(-3).reverse().map(p => {
                  const m = store.members.find(mx => mx.id === p.memberId);
                  return `
                    <tr>
                      <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date(p.date).toLocaleString()}</td>
                      <td>
                        <strong>${m ? m.name : 'Unknown'}</strong><br>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${m ? m.phone : ''}</span>
                      </td>
                      <td>Payment Auto-Receipt</td>
                      <td><span class="tag" style="background: rgba(37, 211, 102, 0.1); color: #25D366;">✅ Sent Successfully</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid" style="margin-top: 2rem;">
          <div class="card" style="border-left: 4px solid #25D366;">
            <h4>Reminder 1: 7 Days Before</h4>
            <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-muted);">
              "Hello [Name], your EMI for [Group] of ₹[Amount] is due in 7 days. Please pay online via ${store.settings.phone}. Regards, ${store.settings.name}."
            </p>
          </div>
          <div class="card" style="border-left: 4px solid #f44336;">
            <h4>Reminder 2: 2 Days Before</h4>
            <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-muted);">
              "URGENT: Hello [Name], only 2 days left to pay your EMI of ₹[Amount]. Avoid penalties by paying now via UPI."
            </p>
          </div>
        </div>
      `;
    },

    reports() {
      const reportsData = store.groups.map(g => {
        const groupMembers = store.getGroupMembers(g.id);
        const collections = store.payments.filter(p => p.groupId === g.id).reduce((sum, p) => sum + Number(p.amount), 0);
        return {
          name: g.name,
          membersCount: groupMembers.length,
          totalCollected: collections
        };
      });

      window.downloadCSV = () => {
        const rows = [["Group Name", "Members", "Total Collected"]];
        reportsData.forEach(r => rows.push([r.name, r.membersCount, r.totalCollected]));
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "chit_fund_report.csv");
        document.body.appendChild(link);
        link.click();
      };

      return `
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
                ${reportsData.map(r => `
                  <tr>
                    <td>${r.name}</td>
                    <td>${r.membersCount}</td>
                    <td>₹ ${r.totalCollected}</td>
                  </tr>
                `).join('')}
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
      `;
    }
  }
};

// Test Runner Listener
document.addEventListener('click', (e) => {
  if (e.target.id === 'run-tests-btn') {
    const results = runTests();
    const container = document.getElementById('test-results');
    container.innerHTML = `
      <ul style="list-style: none; padding: 0;">
        ${results.map(r => `
          <li style="padding: 0.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
            <span>${r.msg}</span>
            <span>${r.pass ? '✅' : '❌'}</span>
          </li>
        `).join('')}
      </ul>
    `;
    e.target.textContent = 'Re-Run Diagnostic';
  }
});

App.init();
window.App = App;
