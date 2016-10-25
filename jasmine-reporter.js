/**
 * Created by smartface on 10/18/16.
 */
var Jasmine = require('jasmine');
var jasmineReporters = require('jasmine-reporters');

var jrunner = new Jasmine();
jrunner.configureDefaultReporter({print: "noop"});    // jasmine < 2.4.1, remove default reporter logs
jrunner.env.clearReporters();                       // jasmine >= 2.5.2, remove default reporter logs
jrunner.addReporter(new jasmineReporters.TerminalReporter({
    consolidateAll: false,
    color: true,
    verbosity: 3,
    showStack: true
}));            // add jasmine-spec-reporter
jrunner.loadConfigFile();                           // load jasmine.json configuration
jrunner.execute();
