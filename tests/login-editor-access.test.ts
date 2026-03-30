// Simple test for login editor access functionality
import { canEditLoginTextByEmail } from "../client/src/lib/login-editor-access.ts";

console.log("Testing login editor access:");

// Test cases
const testCases = [
  { email: "borbaggabriel@gmail.com", expected: true },
  { email: "  BORBAGGABRIEL@GMAIL.COM  ", expected: true },
  { email: "outro.usuario@gmail.com", expected: false },
  { email: null, expected: false },
  { email: undefined, expected: false },
  { email: "", expected: false },
];

let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  const result = canEditLoginTextByEmail(testCase.email);
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${passed ? "✅ PASS" : "❌ FAIL"} - Email: ${testCase.email} -> ${result}`);
  
  if (!passed) {
    allTestsPassed = false;
    console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
  }
});

if (allTestsPassed) {
  console.log("\n🎉 All tests passed!");
} else {
  console.log("\n❌ Some tests failed!");
  process.exit(1);
}
