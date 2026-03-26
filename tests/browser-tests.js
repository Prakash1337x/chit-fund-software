import { store } from '../store.js';

/**
 * Legacy UI-compatible test runner for in-browser diagnostic
 */
export function runTests() {
  const results = [];
  const log = (msg, pass) => results.push({ msg, pass });

  try {
    // Basic connectivity test
    log('Store object initialized', !!store);
    
    // Test collection math
    const start = store.calculateTotalCollection();
    store.payments.push({ amount: 10, memberId: 'tmp', groupId: 'tmp' });
    const end = store.calculateTotalCollection();
    log('Collection calculation integrity', end === start + 10);
    store.payments.pop(); // cleanup

    // Group member logic
    const testGroup = { id: 'test-qa', name: 'QA Group' };
    store.groups.push(testGroup);
    store.members.push({ name: 'QA Member', groupId: 'test-qa' });
    log('Group-Member relational mapping', store.getGroupMembers('test-qa').length === 1);
    store.groups.pop();
    store.members.pop();

    // Auction logic check
    const startAuctions = store.auctions.length;
    store.addAuction({ groupId: 'tmp', winnerId: 'tmp', bidAmount: 500 });
    log('Auction recording integrity', store.auctions.length === startAuctions + 1);
    store.auctions.pop();

    return results;
  } catch (e) {
    console.error(e);
    return [{ msg: 'Critical Test Failure: ' + e.message, pass: false }];
  }
}
