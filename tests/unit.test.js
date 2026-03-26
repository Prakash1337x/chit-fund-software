import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '../store.js';

describe('Sivam Crackers Chit Fund Store', () => {
  beforeEach(() => {
    localStorage.clear();
    store.groups = [];
    store.members = [];
    store.payments = [];
    store.settings = { name: 'Sivam Crackers', logo: 'SC' };
  });

  it('should add a group correctly and auto-calculate duration', () => {
    const group = { name: 'Diwali 2026', totalValue: 120000, installment: 10000 };
    store.addGroup(group);
    expect(store.groups.length).toBe(1);
    expect(store.groups[0].durationMonths).toBe(12);
    expect(store.groups[0].startDate).toBeDefined();
    expect(store.groups[0].endDate).toBeDefined();
  });

  it('should register a member and link to a group', () => {
    store.addGroup({ name: 'Group A' });
    const groupId = store.groups[0].id;
    store.addMember({ name: 'John Doe', phone: '1234567890', groupId });
    
    expect(store.members.length).toBe(1);
    expect(store.getGroupMembers(groupId).length).toBe(1);
    expect(store.getGroupMembers(groupId)[0].name).toBe('John Doe');
  });

  it('should record payments and calculate total collection correctly', () => {
    store.addGroup({ id: 'g1', name: 'Group 1' });
    store.addMember({ id: 'm1', name: 'Member 1', groupId: 'g1' });
    
    store.recordPayment({ memberId: 'm1', amount: 5000, groupId: 'g1' });
    store.recordPayment({ memberId: 'm1', amount: 5000, groupId: 'g1' });
    
    expect(store.payments.length).toBe(2);
    expect(store.calculateTotalCollection()).toBe(10000);
  });

  it('should update business settings', () => {
    store.updateSettings({ name: 'New Sivam Crackers', location: 'New Location' });
    expect(store.settings.name).toBe('New Sivam Crackers');
    expect(store.settings.location).toBe('New Location');
  });

  it('should calculate member EMI status correctly', () => {
    store.addGroup({ id: 'g1', name: 'Group 1', totalValue: 120000, installment: 10000, durationMonths: 12 });
    store.addMember({ id: 'm1', name: 'Member 1', groupId: 'g1' });
    
    store.recordPayment({ memberId: 'm1', amount: 10000, groupId: 'g1' });
    
    const status = store.getMemberEmiStatus('m1');
    expect(status.paidMonths).toBe(1);
    expect(status.pendingMonths).toBe(11);
    expect(status.nextEmiNumber).toBe(2);
    expect(status.paidAmount).toBe(10000);
    expect(status.pendingAmount).toBe(110000);
  });
});


