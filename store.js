export const store = {
  settings: JSON.parse(localStorage.getItem('sc_settings')) || {
    name: 'Sivam Crackers',
    logo: 'SC',
    location: 'Sivakasi, TN',
    phone: '9876543210',
    address: 'No. 42, Sivakasi Main Road, Sivakasi - 626123',
    bannerImages: []
  },
  
  groups: JSON.parse(localStorage.getItem('sc_groups')) || [],
  members: JSON.parse(localStorage.getItem('sc_members')) || [],
  payments: JSON.parse(localStorage.getItem('sc_payments')) || [],

  isAdmin: typeof sessionStorage !== 'undefined' && sessionStorage.getItem('sc_is_admin') === 'true',

  save() {
    localStorage.setItem('sc_settings', JSON.stringify(this.settings));
    localStorage.setItem('sc_groups', JSON.stringify(this.groups));
    localStorage.setItem('sc_members', JSON.stringify(this.members));
    localStorage.setItem('sc_payments', JSON.stringify(this.payments));
  },

  login(username, password) {
    if (username === 'admin' && password === 'admin123') {
      this.isAdmin = true;
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('sc_is_admin', 'true');
      return true;
    }
    return false;
  },

  logout() {
    this.isAdmin = false;
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('sc_is_admin');
  },

  addGroup(group) {
    const totalValue = Number(group.totalValue) || 0;
    const duration = parseInt(group.durationMonths) || 12;
    const installment = Math.ceil(totalValue / duration);
    const startDate = new Date().toISOString().split('T')[0];
    const start = new Date(startDate);
    const end = new Date(start.setMonth(start.getMonth() + duration));
    
    this.groups.push({ 
      ...group, 
      id: group.id || Date.now().toString(),
      installment,
      startDate,
      endDate: end.toISOString().split('T')[0],
      durationMonths: duration
    });
    this.save();
  },

  addMember(member) {
    this.members.push({ 
      ...member, 
      id: member.id || Date.now().toString(), 
      joinedAt: new Date().toISOString(),
      paymentMode: member.paymentMode || 'UPI'
    });
    this.save();
  },

  recordPayment(payment) {
    this.payments.push({ 
      ...payment, 
      id: payment.id || Date.now().toString(), 
      date: new Date().toISOString(),
      emiNumber: this.getNextEmiNumber(payment.memberId)
    });
    this.save();
  },

  getNextEmiNumber(memberId) {
    const memberPayments = this.getMemberPayments(memberId);
    return memberPayments.length + 1;
  },

  getMemberEmiStatus(memberId) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return null;
    const group = this.groups.find(g => g.id === member.groupId);
    if (!group) return null;

    const payments = this.getMemberPayments(memberId);
    const paidMonths = payments.length;
    const totalMonths = parseInt(group.durationMonths);
    const pendingMonths = Math.max(0, totalMonths - paidMonths);
    const totalAmount = group.totalValue;
    const monthlyInstallment = group.installment;
    const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingAmount = Math.max(0, (totalMonths * monthlyInstallment) - paidAmount);

    // Check if paid for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const paidThisMonth = payments.some(p => {
      const d = new Date(p.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Calculate dates
    const joinedDateObj = new Date(member.joinedAt || new Date());
    const endDateObj = new Date(joinedDateObj);
    endDateObj.setMonth(endDateObj.getMonth() + totalMonths);
    
    const nextEmiDateObj = new Date(joinedDateObj);
    nextEmiDateObj.setMonth(nextEmiDateObj.getMonth() + paidMonths + 1);

    return {
      paidMonths,
      totalMonths,
      pendingMonths,
      totalAmount,
      monthlyInstallment,
      paidAmount,
      pendingAmount,
      paidThisMonth,
      nextEmiNumber: paidMonths + 1,
      startDate: joinedDateObj.toLocaleDateString(),
      endDate: endDateObj.toLocaleDateString(),
      nextEmiDate: nextEmiDateObj.toLocaleDateString()
    };
  },

  addAuction(auction) {
    this.auctions.push({ ...auction, id: Date.now().toString(), date: new Date().toISOString() });
    this.save();
  },

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
  },

  calculateTotalCollection() {
    return this.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  },

  getMemberPayments(memberId) {
    return this.payments.filter(p => p.memberId === memberId);
  },

  getGroupMembers(groupId) {
    return this.members.filter(m => m.groupId === groupId);
  }
};
