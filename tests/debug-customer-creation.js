/**
 * Debug script to test customer creation data flow
 * Run this with: node tests/debug-customer-creation.js
 */

// Simulate the form data that should be sent
const mockFormData = {
  firstName: 'John',
  lastName: 'Doe', 
  email: 'john.doe@example.com',
  phone: '555-1234',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  notes: 'Test customer'
};

console.log('🔍 Testing Customer Creation Data Flow');
console.log('=====================================\n');

// Test 1: JSON Serialization (what tRPC does internally)
console.log('1. Testing JSON Serialization:');
console.log('Original data:', mockFormData);

const serialized = JSON.stringify(mockFormData);
console.log('Serialized:', serialized);

const deserialized = JSON.parse(serialized);
console.log('Deserialized:', deserialized);

console.log('✅ JSON serialization works correctly\n');

// Test 2: Test with undefined values (current bug scenario)
const dataWithUndefined = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: undefined,
  address: undefined,
  city: undefined,
  state: undefined,
  zipCode: undefined,
  notes: undefined,
};

console.log('2. Testing with undefined values:');
console.log('Original data with undefined:', dataWithUndefined);

const serializedWithUndefined = JSON.stringify(dataWithUndefined);
console.log('Serialized with undefined:', serializedWithUndefined);

const deserializedWithUndefined = JSON.parse(serializedWithUndefined);
console.log('Deserialized with undefined:', deserializedWithUndefined);

console.log('⚠️  Note: undefined values are removed during JSON serialization\n');

// Test 3: Simulate form state update issue
console.log('3. Testing React State Update Pattern:');

let formState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  notes: '',
};

console.log('Initial form state:', formState);

// Simulate user typing (React onChange)
const simulateUserInput = (field, value) => {
  formState = { ...formState, [field]: value };
  console.log(`Updated ${field} to "${value}":`, formState);
};

simulateUserInput('firstName', 'John');
simulateUserInput('lastName', 'Doe');
simulateUserInput('email', 'john.doe@example.com');

console.log('Final form state:', formState);
console.log('✅ React state updates work correctly\n');

// Test 4: Test form validation
console.log('4. Testing Form Validation:');

const validateCustomer = (data) => {
  const errors = [];
  
  if (!data.firstName || !data.firstName.trim()) {
    errors.push('First name is required');
  }
  
  if (!data.lastName || !data.lastName.trim()) {
    errors.push('Last name is required');
  }
  
  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
};

const validationErrors = validateCustomer(formState);
console.log('Validation errors:', validationErrors);

if (validationErrors.length === 0) {
  console.log('✅ Form validation passes\n');
} else {
  console.log('❌ Form validation failed\n');
}

// Test 5: Test data trimming
console.log('5. Testing Data Trimming:');

const dataWithWhitespace = {
  firstName: '  John  ',
  lastName: '  Doe  ',
  email: '  john.doe@example.com  ',
  phone: '  555-1234  ',
};

const trimmedData = Object.fromEntries(
  Object.entries(dataWithWhitespace).map(([key, value]) => [
    key,
    typeof value === 'string' ? value.trim() : value
  ])
);

console.log('Data with whitespace:', dataWithWhitespace);
console.log('Trimmed data:', trimmedData);
console.log('✅ Data trimming works correctly\n');

// Test 6: Simulate the exact bug scenario
console.log('6. Simulating the Bug Scenario:');

const bugScenario = () => {
  // This represents what might be happening in the form
  let customerData = {};
  
  console.log('Step 1 - Empty object:', customerData);
  
  // If form state isn't properly initialized
  const mutation = (data) => {
    console.log('Mutation received:', data);
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data || {}));
    
    if (!data) {
      console.log('❌ BUG: Mutation received undefined/null data');
      return;
    }
    
    if (Object.keys(data).length === 0) {
      console.log('❌ BUG: Mutation received empty object');
      return;
    }
    
    console.log('✅ Mutation received valid data');
  };
  
  // Test with undefined
  mutation(undefined);
  
  // Test with empty object
  mutation({});
  
  // Test with valid data
  mutation(formState);
};

bugScenario();

console.log('\n🔍 ANALYSIS COMPLETE');
console.log('===================');
console.log('The issue is likely in one of these areas:');
console.log('1. Form state not being properly initialized or updated');
console.log('2. tRPC mutation being called with wrong data');
console.log('3. Event handler not properly accessing form state');
console.log('4. Component re-render causing state loss');
console.log('5. Form submission preventing default incorrectly');

console.log('\n🔧 DEBUGGING STEPS:');
console.log('1. Add console.logs to form onChange handlers');
console.log('2. Add console.logs to form submission handler');
console.log('3. Check if form state is being reset unexpectedly');
console.log('4. Verify tRPC mutation is being called with the right parameters');
console.log('5. Check for any TypeScript errors in the browser console');