/* global QUnit */
sap.ui.require([
	'sap/ui/support/supportRules/IssueManager',
	'sap/ui/support/supportRules/RuleSet',
	'sap/ui/support/supportRules/Storage'],
	function (IssueManager, RuleSet, Storage, Main) {
		"use strict";

		var createValidIssue = function () {
			return {
				details: 'detailsStr',
				severity: 'Medium',
				context: {
					id: 'testId'
				}
			};
		};

		QUnit.module('IssueManager API test', {
			setup: function () {
				this.IssueManager = sap.ui.support.supportRules.IssueManager;
				this.ruleSet = new sap.ui.support.supportRules.RuleSet({ name: 'testRuleSet' });
				this.ruleSet.addRule(window.saptest.createValidRule('id1'));
				this.IssueManagerFacade = this.IssueManager.createIssueManagerFacade(this.ruleSet.getRules().id1);
				this.issue = createValidIssue();
			},
			teardown: function () {
				sap.ui.support.supportRules.RuleSet.clearAllRuleSets();
				this.issue = null;
				this.IssueManager.clearIssues();
				this.IssueManager.clearHistory();
			}
		});

		QUnit.test('IssueManager createIssueManagerFacade', function (assert) {
			assert.ok(this.IssueManagerFacade, 'IssueManagerFacade has been created successfully !');
		});

		QUnit.test('IssueManager addIssue without severity', function (assert) {
			delete this.issue.severity;

			assert.throws(function () {
				this.IssueManagerFacade.addIssue(this.issue);
			}, 'Should throw errror if no severity is provided');
		});

		QUnit.test('IssueManager addIssue with non existing severity', function (assert) {
			this.issue.severity = 'nonexistingseverity';

			assert.throws(function () {
				this.IssueManagerFacade.addIssue(this.issue);
			}, 'Should throw errror severity is not in the sap.ui.support.Severity enum');
		});

		QUnit.test('IssueManager addIssue without context', function (assert) {
			delete this.issue.context;

			assert.throws(function () {
				this.IssueManagerFacade.addIssue(this.issue);
			}, 'Should throw errror if no context is provided');
		});

		QUnit.test('IssueManager addIssue without context id', function (assert) {
			delete this.issue.context.id;

			assert.throws(function () {
				this.IssueManagerFacade.addIssue(this.issue);
			}, 'Should throw errror if no context ID is provided');
		});

		QUnit.test('IssueManager walkIssue', function (assert) {
			var issueCount = 10,
				walkCounter = 0;

			for (var i = 0; i < issueCount; i++) {
				this.IssueManagerFacade.addIssue(createValidIssue());
			}

			this.IssueManager.walkIssues(function () {
				walkCounter++;
			});

			assert.equal(issueCount, walkCounter, 'Should walk exactly as many issues as were added');
		});

		QUnit.test('IssueManager clearIssues', function (assert) {
			var issueCount = 10,
				walkCounter = 0;
			for (var i = 0; i < issueCount; i++) {
				this.IssueManagerFacade.addIssue(createValidIssue());
			}

			this.IssueManager.clearIssues();

			this.IssueManager.walkIssues(function () {
				walkCounter++;
			});

			assert.equal(walkCounter, 0, 'No issues should be visited');
		});

		QUnit.test('IssueManager clearIssues', function (assert) {
			var issueCount = 10;
			for (var i = 0; i < issueCount; i++) {
				this.IssueManagerFacade.addIssue(createValidIssue());
			}

			this.IssueManager.clearIssues();

			assert.equal(this.IssueManager.getHistory()[0].issues.length, issueCount, 'Should dump them to history');
		});

		QUnit.test('IssueManager getHistory', function (assert) {
			var issueCount = 10,
				secondIssueCount = 5;

			for (var i = 0; i < issueCount; i++) {
				this.IssueManagerFacade.addIssue(createValidIssue());
			}

			var firstHistoryLength = this.IssueManager.getHistory()[0].issues.length;

			for (var j = 0; j < secondIssueCount; j++) {
				this.IssueManagerFacade.addIssue(createValidIssue());
			}

			var secondHistoryLength = this.IssueManager.getHistory()[1].issues.length;

			assert.equal(firstHistoryLength, issueCount, 'Should have the same amount of elements as added with addIssue()');
			assert.equal(secondHistoryLength, secondIssueCount, 'Should have the same amount of elements as added with addIssue()');
			assert.equal(firstHistoryLength + secondHistoryLength, issueCount + secondIssueCount, 'Sum of 2 history gets should be equal to total added issues');
		});

		QUnit.test('IssueManager getConvertedHistory & convertToViewModel', function (assert) {
			var issueCount = 10;

			for (var i = 0; i < issueCount; i++) {
				this.IssueManagerFacade.addIssue(createValidIssue());
			}

			assert.throws(function () {
				this.IssueManagerFacade.getConvertedHistory();
			}, 'Should throw errror if no convertedHistory & convertToViewModel don\'t work');

			var convertedHistory = this.IssueManager.getConvertedHistory();

			assert.ok(convertedHistory[0].issues instanceof Object, 'Issues is of type Object !');

			assert.ok(convertedHistory[0].issues.testRuleSet.id1 instanceof Array, 'There are issues in the History !');

			assert.equal(convertedHistory[0].issues.testRuleSet.id1[0].ruleId, 'id1', 'Issue with the correct id has been set inside the History !');
		});

		QUnit.test('IssueManager getIssuesViewModel', function (assert) {
			var issueCount = 10;

			for (var i = 0; i < issueCount; i++) {
				this.IssueManagerFacade.addIssue(this.issue);
			}

			var issuesViewModel = this.IssueManager.getIssuesModel();

			assert.ok(issuesViewModel[0] instanceof Object, 'The retrieved model contains Issues !');

			assert.equal(issuesViewModel[0].ruleId, 'id1', 'The retrieved model has an id !');

			assert.equal(issuesViewModel[0].severity, 'Medium', 'The retrieved model has a severity !');
		});

		QUnit.test('IssueManager getRulesViewModel', function (assert) {

			var ruleIds = {
				placeholderNoDots:true,
				preloadAsyncCheck :true,
				segmentedButtonMixedItems:true,
				selectUsage:true,
				selectionDetailsNumberOfActionGroups:true,
				stableId:true,
				texttooltip:true,
				tokenparent:true,
				unresolvedPropertyBindings:true,
				wizardBranchingAssociations:true,
				wizardStepParent:true
			};
			var ruleSets = {
				temporary: {
					lib: {
						name: 'temporary'
					},
					ruleset: {
						_mRules: {},
						_oSettings: {
							name: 'temporary'
						}
					}
				}
			};

			var issues = this.IssueManager.groupIssues(this.IssueManager.getIssuesViewModel());

			var rulesViewModel = this.IssueManager.getRulesViewModel(ruleSets, ruleIds, issues);

			assert.strictEqual((rulesViewModel instanceof Object), true, 'The rulesViewModel is returned successfully !');

			assert.ok(rulesViewModel.temporary, 'The view model contains the previous set ruleSet !');
		});

		QUnit.test('IssueManager groupIssues', function(assert) {
			var issues,
				issue = createValidIssue();

			issue.context.id = 'testId - 1';
			issue.ruleId = '1';
			this.IssueManagerFacade.addIssue(issue);
			issues = this.IssueManager.getIssuesModel();

			assert.strictEqual(issues[0] instanceof Object, true, 'The retrieved issues are of type Object !');
			assert.ok(issues[0].ruleId, 'The retrieved issues has a ruleId !');
			assert.ok(issues[0].ruleId === 'id1', 'The retrieved issues have the correct id set !');
			assert.ok(issues[0].details === 'detailsStr', 'The issue contains the correct details !');
			assert.ok(issues[0].context, 'The retrieved issues have a context !');
			assert.ok(issues[0].context.id === 'testId - 1', 'The context within the issues has the correct id !');
			assert.ok(issues[0].audiences, 'The retrieved issues have audiences !');
			assert.ok(issues[0].categories, 'The retrieved issues have categories !');
			assert.ok(issues[0].audiences[0], 'The audiences aren\'t empthy !');
			assert.ok(issues[0].categories[0], 'The categories aren\'t empthy !');

			issues = this.IssueManager.groupIssues(issues);

			assert.strictEqual(issues.testRuleSet instanceof Object, true, 'The retrieved issues have been grouped in a single rule set !');
			assert.strictEqual(issues.testRuleSet.id1 instanceof Array, true, 'The rule within the rule set has issues !');
			assert.strictEqual(issues.testRuleSet.id1[0].ruleId === 'id1', true, 'The rule has the correct ruleId set to it !');
			assert.strictEqual(issues.testRuleSet.id1[0].ruleLibName === 'testRuleSet', true, 'The grouped issues have the correct ruleLibName set !');
			assert.ok(issues.testRuleSet.id1[0].context, 'The grouped issues have a context !');
			assert.ok(issues.testRuleSet.id1[0].context.id, 'The context within the grouped issues has a id !');
			assert.ok(issues.testRuleSet.id1[0].context.id === 'testId - 1', 'The context has a correct id !');
			assert.ok(issues.testRuleSet.id1[0].audiences, 'The grouped issues have audiences !');
			assert.ok(issues.testRuleSet.id1[0].categories, 'The grouped issues have categories !');
			assert.ok(issues.testRuleSet.id1[0].audiences[0], 'The audiences aren\'t empthy !');
			assert.ok(issues.testRuleSet.id1[0].categories[0], 'The categories aren\'t empthy !');
		});
	});