import { BLACKLISTED_EMAILS } from "../constants/blacklisted-emails.constant";

/**
 * Checks if an email appears to be a dummy/test email
 * @param email Email address to check
 * @returns boolean indicating if email is likely a dummy/test email
 */
export function isDummyEmail(email: string): boolean {
  const lowercaseEmail = email.toLowerCase();
  
  // Check against blacklisted emails
  if (BLACKLISTED_EMAILS.includes(lowercaseEmail)) {
    return true;
  }

  // Common test keywords
  const testPatterns = [
    'test',
    'dummy',
    'sample',
    'example',
    'fake',
    'temp',
    'disposable',
    'mailinator'
  ];

  // Common test domains
  const testDomains = [
    'mailinator.com',
    'tempmail.com',
    'test.com',
    'example.com',
    'yopmail.com',
    'guerrillamail.com',
    'sharklasers.com',
    'temp-mail.org'
  ];

  // Check for test patterns in local part
  const [localPart, domain] = lowercaseEmail.split('@');
  if (testPatterns.some(pattern => localPart.includes(pattern))) {
    return true;
  }

  // Check for test domains
  if (testDomains.includes(domain)) {
    return true;
  }

  // Check for numbered patterns (e.g., test1, test2, user123)
  if (/^(test|user|temp|dummy)\d+/.test(localPart)) {
    return true;
  }

  return false;
} 