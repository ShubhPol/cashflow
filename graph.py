from langgraph.graph import StateGraph, END

# ==========================================
# FUNCTION
# ==========================================

def process_pdf(state):

    file_path = state["file_path"]

    # Dummy output
    return {
        "text_path": "output/raw_text.txt",
        "csv_path": "output/transactions.csv"
    }

# ==========================================
# CREATE GRAPH
# ==========================================

workflow = StateGraph(dict)

workflow.add_node(
    "process_pdf",
    process_pdf
)

workflow.set_entry_point("process_pdf")

workflow.add_edge(
    "process_pdf",
    END
)

# IMPORTANT
app = workflow.compile()