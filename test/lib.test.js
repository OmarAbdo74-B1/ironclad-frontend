import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, formatSpecs, safeImageUrl, environmentLabel, categories } from '../public/lib.js';

test('formatPrice formats USD without decimals', () => {
  assert.equal(formatPrice(241300), '$241,300');
});

test('formatPrice handles missing or invalid values', () => {
  assert.equal(formatPrice(undefined), 'Price on request');
  assert.equal(formatPrice(Number.NaN), 'Price on request');
  assert.equal(formatPrice('100'), 'Price on request');
});

test('formatSpecs joins available specs', () => {
  assert.equal(formatSpecs({ horsepower: 518, topSpeedKmh: 296 }), '518 HP · 296 km/h');
  assert.equal(formatSpecs({ horsepower: 518 }), '518 HP');
  assert.equal(formatSpecs({}), '');
});

test('safeImageUrl allows https images from the allowed host', () => {
  const url = 'https://images.unsplash.com/photo-1?w=800';
  assert.equal(safeImageUrl(url), url);
});

test('safeImageUrl blocks other hosts, http, and invalid URLs', () => {
  assert.equal(safeImageUrl('https://evil.example.com/x.png'), '/placeholder.svg');
  assert.equal(safeImageUrl('http://images.unsplash.com/x.png'), '/placeholder.svg');
  assert.equal(safeImageUrl('javascript:alert(1)'), '/placeholder.svg');
  assert.equal(safeImageUrl('not a url'), '/placeholder.svg');
});

test('environmentLabel maps known environments', () => {
  assert.equal(environmentLabel('dev'), 'Development');
  assert.equal(environmentLabel('staging'), 'Staging');
  assert.equal(environmentLabel('prod'), 'Production');
  assert.equal(environmentLabel(undefined), 'Local');
});

test('categories returns unique sorted values', () => {
  const cars = [{ category: 'Supercar' }, { category: 'Hypercar' }, { category: 'Supercar' }];
  assert.deepEqual(categories(cars), ['Hypercar', 'Supercar']);
});
