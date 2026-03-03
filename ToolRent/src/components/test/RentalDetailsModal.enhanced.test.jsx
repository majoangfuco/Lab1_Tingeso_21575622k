import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import RentalDetailsModal from "../RentalDetailsModal";
import KardexService from "../../services/KardexService";

vi.mock("../../services/KardexService");

const mockRental = {
  rentalId: 1,
  rentalDate: 1698768000000,
  returnDate: 1699286400000,
  rentalStatus: 0,
  amountDue: 100
};

const mockTools = [
  {
    toolId: 1,
    informationTool: {
      nameTool: "Hammer",
      brand: "Bosch",
      model: "X1"
    }
  },
  {
    toolId: 2,
    informationTool: {
      nameTool: "Drill",
      brand: "DeWalt",
      model: "DCD777C2"
    }
  }
];

describe("RentalDetailsModal - Comprehensive Coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Tool Loading
  test("loads multiple tools when modal opens", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue(mockTools);
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("Hammer")).toBeInTheDocument();
      expect(screen.getByText("Bosch")).toBeInTheDocument();
      expect(screen.getByText("X1")).toBeInTheDocument();
      expect(screen.getByText("Drill")).toBeInTheDocument();
      expect(screen.getByText("DeWalt")).toBeInTheDocument();
    });
  });

  // Test 2: Loading State
  test("displays loading message while fetching tools", () => {
    KardexService.getToolsByRentalId.mockImplementation(
      () => new Promise(() => {})
    );
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    expect(screen.getByText("Loading tools...")).toBeInTheDocument();
  });

  // Test 3: Empty Tools State
  test("displays empty message when no tools exist", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    await waitFor(() => {
      expect(
        screen.getByText("No tools found for this rental.")
      ).toBeInTheDocument();
    });
  });

  // Test 4: Modal Hidden State
  test("does not render when isOpen is false", () => {
    render(
      <RentalDetailsModal
        isOpen={false}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    expect(
      screen.queryByText(/Rental Details/)
    ).not.toBeInTheDocument();
  });

  // Test 5-7: Status Badges
  test("renders active status badge (status 0)", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    const rental = { ...mockRental, rentalStatus: 0 };
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={rental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  test("renders overdue status badge (status 1)", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    const rental = { ...mockRental, rentalStatus: 1 };
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={rental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("Overdue")).toBeInTheDocument();
    });
  });

  test("renders returned status badge (status 2)", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    const rental = { ...mockRental, rentalStatus: 2 };
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={rental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("Returned")).toBeInTheDocument();
    });
  });

  // Test 8: Rental Information Display
  test("displays all rental information fields", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Rental Details #1/)).toBeInTheDocument();
      expect(screen.getByText("Start Date")).toBeInTheDocument();
      expect(screen.getByText("Expected Return")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Total Amount")).toBeInTheDocument();
      expect(screen.getByText("$100")).toBeInTheDocument();
    });
  });

  // Test 9: Close Button Interaction
  test("calls onClose when close button is clicked", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    const onClose = vi.fn();
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={onClose}
        rental={mockRental}
      />
    );
    
    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  // Test 10: Table Headers
  test("renders tools table with all required headers", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue(mockTools);
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("Tool Name")).toBeInTheDocument();
      expect(screen.getByText("Brand")).toBeInTheDocument();
      expect(screen.getByText("Model")).toBeInTheDocument();
      expect(screen.getByText("ID")).toBeInTheDocument();
    });
  });

  // Test 11: Dynamic Rental ID
  test("displays correct rental ID in modal title", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    const rental = { ...mockRental, rentalId: 42 };
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={rental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Rental Details #42/)).toBeInTheDocument();
    });
  });

  // Test 12: Tools Included Section
  test("displays tools included section header", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue(mockTools);
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("Tools Included")).toBeInTheDocument();
    });
  });

  // Test 13: Null Amount Due
  test("handles null amount due by displaying $0", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    const rental = { ...mockRental, amountDue: null };
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={rental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("$0")).toBeInTheDocument();
    });
  });

  // Test 14: API Error Handling
  test("handles API errors gracefully", async () => {
    KardexService.getToolsByRentalId.mockRejectedValue(
      new Error("API Error")
    );
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("Loading tools...")).toBeInTheDocument();
    });
  });

  // Test 15: Tool Data Structure
  test("correctly renders tool data with optional properties", async () => {
    const toolsWithOptional = [
      {
        toolId: 1,
        informationTool: {
          nameTool: "Test Tool",
          brand: "Test Brand",
          model: "Test Model"
        }
      }
    ];
    
    KardexService.getToolsByRentalId.mockResolvedValue(toolsWithOptional);
    
    render(
      <RentalDetailsModal
        isOpen={true}
        onClose={() => {}}
        rental={mockRental}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText("Test Tool")).toBeInTheDocument();
      expect(screen.getByText("Test Brand")).toBeInTheDocument();
      expect(screen.getByText("Test Model")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });
});
