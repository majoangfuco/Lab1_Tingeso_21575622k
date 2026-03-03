import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import RentalDetailsModal from "../RentalDetailsModal";
import KardexService from "../../services/KardexService";

vi.mock("../../services/KardexService");

// Mock data constants
const MOCK_TOOL = {
  toolId: 1,
  informationTool: {
    nameTool: "Hammer",
    brand: "Bosch",
    model: "X1"
  }
};

const MOCK_RENTAL = {
  rentalId: 1,
  rentalDate: Date.now(),
  returnDate: Date.now(),
  rentalStatus: 0,
  amountDue: 100
};

const RENTAL_STATUSES = {
  ACTIVE: 0,
  OVERDUE: 1,
  RETURNED: 2
};

const STATUS_TEXTS = {
  0: "Active",
  1: "Overdue",
  2: "Returned"
};

describe("RentalDetailsModal", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to simplify render calls
  const renderModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      rental: MOCK_RENTAL
    };
    return render(
      <RentalDetailsModal {...{ ...defaultProps, ...props }} />
    );
  };

  test("loads tools when modal opens", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([MOCK_TOOL]);
    renderModal();

    await waitFor(() => {
      expect(screen.getByText("Hammer")).toBeInTheDocument();
      expect(screen.getByText("Bosch")).toBeInTheDocument();
      expect(screen.getByText("X1")).toBeInTheDocument();
    });
  });


  test("shows message when no tools exist", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    renderModal();

    await waitFor(() => {
      expect(
        screen.getByText("No tools found for this rental.")
      ).toBeInTheDocument();
    });
  });


  test("does not render when modal is closed", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByText(/Rental Details/)
    ).not.toBeInTheDocument();
  });


  test("renders overdue status badge", () => {
    renderModal({ rental: { ...MOCK_RENTAL, rentalStatus: RENTAL_STATUSES.OVERDUE } });
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });


  test("renders returned status badge", () => {
    renderModal({ rental: { ...MOCK_RENTAL, rentalStatus: RENTAL_STATUSES.RETURNED } });
    expect(screen.getByText("Returned")).toBeInTheDocument();
  });

  test("renders active status badge", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    renderModal({ rental: { ...MOCK_RENTAL, rentalStatus: RENTAL_STATUSES.ACTIVE } });

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  test("displays all rental information fields", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    renderModal();

    await waitFor(() => {
      expect(screen.getByText(/Rental Details #1/)).toBeInTheDocument();
      expect(screen.getByText("Start Date")).toBeInTheDocument();
      expect(screen.getByText("Expected Return")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Total Amount")).toBeInTheDocument();
      expect(screen.getByText("$100")).toBeInTheDocument();
    });
  });

  test("renders close button and calls onClose when clicked", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    const onClose = vi.fn();
    renderModal({ onClose });

    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  test("renders tools table with correct headers", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([MOCK_TOOL]);
    renderModal();

    await waitFor(() => {
      expect(screen.getByText("Tool Name")).toBeInTheDocument();
      expect(screen.getByText("Brand")).toBeInTheDocument();
      expect(screen.getByText("Model")).toBeInTheDocument();
      expect(screen.getByText("ID")).toBeInTheDocument();
    });
  });

  test("displays tools included section", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([MOCK_TOOL]);
    renderModal();

    await waitFor(() => {
      expect(screen.getByText("Tools Included")).toBeInTheDocument();
    });
  });

  test("handles null amount due by displaying $0", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    renderModal({ rental: { ...MOCK_RENTAL, amountDue: null } });

    await waitFor(() => {
      expect(screen.getByText("$0")).toBeInTheDocument();
    });
  });

  test("displays correct rental ID in modal title", async () => {
    KardexService.getToolsByRentalId.mockResolvedValue([]);
    renderModal({ rental: { ...MOCK_RENTAL, rentalId: 42 } });

    await waitFor(() => {
      expect(screen.getByText(/Rental Details #42/)).toBeInTheDocument();
    });
  });

  test("shows loading message while fetching tools", () => {
    KardexService.getToolsByRentalId.mockImplementation(
      () => new Promise(() => {})
    );
    renderModal();

    expect(screen.getByText("Loading tools...")).toBeInTheDocument();
  });

});
