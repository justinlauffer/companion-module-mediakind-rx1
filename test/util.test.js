const { test } = require('node:test')
const assert = require('node:assert/strict')

const { formatBitrate, sanitizeName } = require('../src/util')

test('formatBitrate: not receiving returns No Data', () => {
    assert.equal(formatBitrate(5000000, false), 'No Data')
})

test('formatBitrate: null/undefined returns No Data', () => {
    assert.equal(formatBitrate(null), 'No Data')
    assert.equal(formatBitrate(undefined), 'No Data')
})

test('formatBitrate: zero returns no-signal hint', () => {
    assert.equal(formatBitrate(0), '0 Mbps (No Signal)')
})

test('formatBitrate: formats Mbps with two decimals', () => {
    assert.equal(formatBitrate(1000000), '1.00 Mbps')
    assert.equal(formatBitrate(12340000), '12.34 Mbps')
})

test('sanitizeName: replaces non-alphanumeric characters with underscore', () => {
    assert.equal(sanitizeName('Service 1'), 'Service_1')
    assert.equal(sanitizeName('CH-A/B.1'), 'CH_A_B_1')
    assert.equal(sanitizeName('already_safe_99'), 'already_safe_99')
})
