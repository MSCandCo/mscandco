// Script to test role badges for all users
const users = [
  { email: 'superadmin@mscandco.com', expectedRole: 'Super Admin', tested: true },
  { email: 'companyadmin@mscandco.com', expectedRole: 'Company Admin', tested: true },
  { email: 'labeladmin@mscandco.com', expectedRole: 'Label Admin', tested: false },
  { email: 'analytics@mscandco.com', expectedRole: 'Financial Admin', tested: false },
  { email: 'requests@mscandco.com', expectedRole: 'Requests Admin', tested: false },
  { email: 'codegroup@mscandco.com', expectedRole: 'Distribution Partner', tested: false },
  { email: 'info@htay.co.uk', expectedRole: 'Artist', tested: false }
];

const password = 'TestPass123!';

console.log('=== ROLE BADGE TEST RESULTS ===\n');
console.log('Tested Users:');
users.filter(u => u.tested).forEach(u => {
  console.log(`✅ ${u.email} - Expected: ${u.expectedRole}`);
});

console.log('\nRemaining Users to Test:');
users.filter(u => !u.tested).forEach(u => {
  console.log(`⏳ ${u.email} - Expected: ${u.expectedRole}`);
});
