PYTHON := python
SCRIPT := scripts/summary.py
GEN_DUMMY := scripts/dummy_gen.py
LOG := pipeline.log

# === Test Commands ===

test-label:
	@echo "🧪 Running full labeling + snapshot (TEST_MODE)..." | tee -a $(LOG)
	TEST_MODE=1 EXPORT_ONLY=0 $(PYTHON) -m cProfile -s time $(SCRIPT) 2>&1 | tee -a $(LOG)

test-export:
	@echo "📦 Exporting summary JSONs only from test DB (TEST_MODE)..." | tee -a $(LOG)
	TEST_MODE=1 EXPORT_ONLY=1 $(PYTHON) -m cProfile -s time $(SCRIPT) 2>&1 | tee -a $(LOG)

test-db-to-db:
	@echo "🔄 Generating snapshot DB from posts_labeled..." | tee -a $(LOG)
	TEST_MODE=1 SKIP_LABELING=1 $(PYTHON) -m cProfile -s time $(SCRIPT) 2>&1 | tee -a $(LOG)

test-full:
	@echo "🔄 Running full labeling + snapshot in TEST_MODE..." | tee -a $(LOG)
	make clean-test-db
	@echo "📦 Exporting summary JSONs only from test DB..." | tee -a $(LOG)
	TEST_MODE=1 EXPORT_ONLY=0 $(PYTHON) -m cProfile -s time $(SCRIPT) 2>&1 | tee -a $(LOG)
	TEST_MODE=1 EXPORT_ONLY=1 $(PYTHON) -m cProfile -s time $(SCRIPT) 2>&1 | tee -a $(LOG)
	make test-jsons

# === Production Commands ===

prod-label:
	@echo "🚀 Running full labeling + snapshot on PROD DB..." | tee -a $(LOG)
	EXPORT_ONLY=0 $(PYTHON) $(SCRIPT) 2>&1 | tee -a $(LOG)

prod-export:
	@echo "📦 Exporting summary JSONs only from PROD DB..." | tee -a $(LOG)
	EXPORT_ONLY=1 $(PYTHON) $(SCRIPT) 2>&1 | tee -a $(LOG)

# === Utility ===

clean-test-db:
	@echo "🧹 Removing local test DB..." | tee -a $(LOG)
	rm -f test_turso_local.db

gen-dummy:
	@echo "🛠️ Generating dummy data..." | tee -a $(LOG)
	$(PYTHON) $(GEN_DUMMY) 2>&1 | tee -a $(LOG)

test-jsons:
	@echo "📄 Testing JSON structures of ref and generated..." | tee -a $(LOG)
	python scripts/compare_json_structure.py summary 2>&1 | tee -a $(LOG)

help:
	@echo "Makefile commands:"
	@echo "  make test-label       - Run full labeling + snapshot in TEST_MODE"
	@echo "  make test-export      - Export summary JSONs only from test DB"
	@echo "  make test-db-to-db    - Generate snapshot DB from posts_labeled"
	@echo "  make test-full        - Run full labeling + snapshot in TEST_MODE and export"
	@echo "  make prod-label       - Run full labeling + snapshot on PROD DB"
	@echo "  make prod-export      - Export summary JSONs only from PROD DB"
	@echo "  make clean-test-db    - Remove local test DB"
	@echo "  make gen-dummy        - Generate dummy data for testing"
	@echo "  make test-jsons       - Test JSON structures of ref and generated"
	@echo "  make help             - Show this help message"
