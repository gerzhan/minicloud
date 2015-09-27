SRC = lib/*.js

include node_modules/make-lint/index.mk

BIN = iojs

ifeq ($(findstring io.js, $(shell which node)),)
	BIN = node
endif

ifeq (node, $(BIN))
	FLAGS = --harmony
endif

REQUIRED = --require should --require should-http --require co-mocha

TESTS = test/devices \
		test/files \
        test/departments \
		test/events \
		test/files-upload \
		test/groups \
		test/members \
		test/console-members \
		test/console-devices \
		test/console-online-devices \
		test/console-events \
		test/console-files \
		test/tags \
		test/unit \
		test/unit/page
		
test:
	@NODE_ENV=test ORM_PROTOCOL=mssql $(BIN) \
		./node_modules/.bin/_mocha \
		$(REQUIRED) \
		$(TESTS) \
		--bail 
test-cov:
	@NODE_ENV=test  ORM_PROTOCOL=mysql $(BIN) $(FLAGS) \
		./node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		$(REQUIRED) \
		$(TESTS) \
		--bail	 
test-travis:
	@NODE_ENV=test ORM_PROTOCOL=sqlite $(BIN) $(FLAGS) \
		./node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		$(REQUIRED) \
		$(TESTS) \
		--bail
	@NODE_ENV=test ORM_PROTOCOL=mysql $(BIN) $(FLAGS) \
		./node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		$(REQUIRED) \
		$(TESTS) \
		--bail 	
bench:
	@$(MAKE) -C benchmarks

.PHONY: test bench
