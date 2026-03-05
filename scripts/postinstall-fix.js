#!/usr/bin/env node
/**
 * Postinstall: Fix expo-file-system ExpoAppDelegate → ExpoAppDelegateSubscriberRepository
 * (Build-Fix für iOS)
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-file-system',
  'ios',
  'FileSystemModule.swift'
);

try {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('ExpoAppDelegate.getSubscriberOfType')) {
      content = content.replace(
        'ExpoAppDelegate.getSubscriberOfType',
        'ExpoAppDelegateSubscriberRepository.getSubscriberOfType'
      );
      fs.writeFileSync(filePath, content);
      console.log('✓ expo-file-system iOS fix applied');
    }
  }
} catch (e) {
  console.warn('postinstall-fix:', e.message);
}
