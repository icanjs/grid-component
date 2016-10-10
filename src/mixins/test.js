import QUnit from 'steal-qunit';
import VM from '../view-model';
import mixin from './mixin-util';
import mixinSort from './sort';
import { mixinSortHelpers } from './sort';
import mixinCheckbox from './checkbox';
import mixinChildRows from './child-rows';
import mixinPagination from './pagination';
import _ from 'lodash';

var vm;

QUnit.module('Grid viewModel', {
  beforeEach: function() {
    vm = new (can.Map.extend(mixin(VM, mixinSort, mixinCheckbox, mixinChildRows)))();
  },

  afterEach: function() {
  }
});

QUnit.test('checkedRows', function(assert) {
  //console.log(vm.attr('rows.length'));
  var count = 0;

  assert.equal(vm.attr('checkedRows.length'), 0, 'there should be 0 checkedRows');

  vm.bind('checkedRows', function(ev, newVal, oldVal){
    if (newVal.hasChanged) {
      //console.log('- Has changed!');
      count++;
    }
    //console.log('- bind change ' + count, newVal, oldVal);
  });

  vm.attr('rows').push({isChecked: true, val: 1});
  vm.attr('rows').push({isChecked: false, val: 1});
  vm.attr('rows').push({isChecked: true, val: 1});
  assert.equal(vm.attr('rows.length'), 3, 'there should be 3 items in rows');
  assert.equal(vm.attr('checkedRows.length'), 2, 'there should be 2 items in checkedRows');
  assert.equal(count, 2, 'checkedRows should have changed 2 times');


  vm.attr('rows', [
    {isChecked: true, val: 1},
    {isChecked: true, val: 1},
    {isChecked: true, val: 1}
  ]);

  count = 0;
  //console.log('replacing rows with the same array');
  vm.attr('rows', [
    {isChecked: true, val: 1},
    {isChecked: true, val: 1},
    {isChecked: true, val: 1}
  ]);
  assert.equal(count, 0, 'should be 0 changes if rows is replaced with the same array');


  count = 0;
  //console.log('replacing rows with a different array of the same length');
  vm.attr('rows', [
    {isChecked: true, val: 1},
    {isChecked: true, val: 2},
    {isChecked: true, val: 1}
  ]);
  assert.equal(vm.attr('checkedRows.length'), 3, 'there should be 3 items in checkedRows');
  assert.equal(count, 1, 'should be 1 change if rows is replaced with a different array of the same length');

  vm.attr('rows', []);

  count = 0;
  //console.log('replacing rows with a different array of the same length');
  vm.attr('rows').push({isChecked: false, val: 1});
  assert.equal(vm.attr('checkedRows.length'), 0, 'there should be 0 items in checkedRows');
  assert.equal(count, 0, 'checkedRows should have changed 0 times for an empty array');
});

QUnit.test('Mixin child-rows', function(assert) {
  vm.attr('rows', [
    {val:1, childrenVisible: false},
    {val:2, childrenVisible: false},
    {val:3, childrenVisible: false}
  ]);
  assert.notOk(vm.attr('rows.0.childrenVisible'), '1st row\' children are hidden');
  vm.toggleChildrenVisible(vm.attr('rows.0'));
  assert.ok(vm.attr('rows.0.childrenVisible'), '1st row\' children should become visible');

  vm.toggleAllChildrenVisible();
  assert.equal(vm.attr('rows').filter(a => a.attr('childrenVisible')).length, vm.attr('rows.length'), 'All rows should have children visible');

  vm.toggleAllChildrenVisible();
  assert.equal(vm.attr('rows').filter(a => a.attr('childrenVisible')).length, 0, 'No rows should have children visible');
});

QUnit.test('Mixin pagination test 2', function(assert) {
  var vm = new (can.Map.extend(mixinPagination))({
    rows: _.times(24, i => i),
    pagination: 10
  });

  assert.equal(vm.attr('rowsPerPage'), 10, 'rowsPerPage is 10');
  assert.equal(vm.attr('totalPages'), 3, 'totalPages is 3');
  assert.equal(vm.attr('hasPages'), true, 'More than 1 page, show nav');
  assert.deepEqual(vm.attr('pagedRows').attr(), _.times(10, i => i), 'should show 1st 10 rows');
  assert.equal(vm.attr('isPrevActive'), false, 'Prev is inactive');

  // page 1:
  vm.next();
  assert.deepEqual(vm.attr('pagedRows').attr(), _.times(10, i => i + 10), 'should show 2nd 10 rows');
  assert.equal(vm.attr('isNextActive'), true, 'Next is active');
  assert.equal(vm.attr('isPrevActive'), true, 'Prev is active');

  // page 2:
  vm.next();
  assert.deepEqual(vm.attr('pagedRows').attr(), _.times(4, i => i + 20), 'should show last 4 rows');
  assert.equal(vm.attr('isNextActive'), false, 'Next is inactive');

  vm.next();
  assert.equal(vm.attr('currentPage'), 2, 'last page should stay #2');

  // page1:
  vm.prev();
  assert.equal(vm.attr('currentPage'), 1, 'prev should move currentPage to #1');

  // page 0:
  vm.prev();
  vm.prev();
  vm.prev();
  assert.equal(vm.attr('currentPage'), 0, '3 x prev should move and keep currentPage to #0');

  vm.changePage(2);
  assert.equal(vm.attr('currentPage'), 1, 'Change page to 2');
});

QUnit.test('Mixin pagination test 2', function(assert) {
  var vm = new (can.Map.extend(mixinPagination))({
    rows: _.times(24, i => i),
    pagination: 25
  });

  // page 0:
  assert.equal(vm.attr('rowsPerPage'), 25, 'rowsPerPage is 25');
  assert.equal(vm.attr('currentPage'), 0, 'currentPage is 0');
  assert.equal(vm.attr('totalPages'), 1, 'totalPages is 1');
  assert.equal(vm.attr('hasPages'), false, 'Only 1 page, hide nav');
});