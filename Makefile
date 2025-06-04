# === CognitiveSky Makefile ===

PYTHON := python
SCRIPT := scripts/summary.py
GEN_DUMMY := scripts/dummy_gen.py

# === Test Commands ===

test-label:
	@echo "🧪 Running full labeling + snapshot (TEST_MODE)..."
	TEST_MODE=1 EXPORT_ONLY=0 $(PYTHON) $(SCRIPT)

test-export:
	@echo "📦 Exporting summary JSONs only from test DB (TEST_MODE)..."
	TEST_MODE=1 EXPORT_ONLY=1 $(PYTHON) $(SCRIPT)

test-db-to-db:
	@echo "🔄 Generating snapshot DB from posts_labeled..."
	TEST_MODE=1 SKIP_LABELING=1 $(PYTHON)

test-full:
	@echo "🔄 Running full labeling + snapshot in TEST_MODE..."
	make clean-test-db
	@echo "📦 Exporting summary JSONs only from test DB..."
	TEST_MODE=1 EXPORT_ONLY=0 $(PYTHON) $(SCRIPT) && TEST_MODE=1 EXPORT_ONLY=1 $(PYTHON) $(SCRIPT)
	make test-jsons

# === Production Commands ===

prod-label:
	@echo "🚀 Running full labeling + snapshot on PROD DB..."
	EXPORT_ONLY=0 $(PYTHON) $(SCRIPT)

prod-export:
	@echo "📦 Exporting summary JSONs only from PROD DB..."
	EXPORT_ONLY=1 $(PYTHON) $(SCRIPT)

# === Utility ===

clean-test-db:
	@echo "🧹 Removing local test DB..."
	rm -f test_turso_local.db

gen-dummy:
	@echo "🛠️ Generating dummy data..."
	$(PYTHON) $(GEN_DUMMY)

test-jsons:
	@echo "📄 Testing JSON sturctures of ref and generated..."
	python scripts/compare_json_structure.py summary

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
