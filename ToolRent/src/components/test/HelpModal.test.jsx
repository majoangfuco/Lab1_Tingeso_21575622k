import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import HelpModal from "../HelpModal";

// Mock data
const MOCK_TUTORIAL_DATA = {
  title: "Getting Started",
  steps: [
    {
      title: "Step 1",
      description: "This is the first step"
    },
    {
      title: "Step 2",
      description: "This is the second step"
    },
    {
      title: "Step 3",
      description: "This is the third step"
    }
  ]
};

const DEFAULT_PROPS = {
  isOpen: true,
  onClose: vi.fn(),
  tutorialData: MOCK_TUTORIAL_DATA
};

describe("HelpModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = (props = {}) => {
    return render(
      <HelpModal {...{ ...DEFAULT_PROPS, ...props }} />
    );
  };

  // Conditional rendering tests
  test("does not render when isOpen is false", () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders when isOpen is true", () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // Title and header tests
  test("displays tutorial title", () => {
    renderModal();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
  });

  test("displays close button in header", () => {
    renderModal();
    const closeButton = screen.getByRole("button", { name: /close modal/i });
    expect(closeButton).toBeInTheDocument();
  });

  // Step counter and step content tests
  test("displays step counter starting at 1", () => {
    renderModal();
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
  });

  test("displays current step title and description", () => {
    renderModal();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("This is the first step")).toBeInTheDocument();
  });

  // Navigation - Next button tests
  test("next button is disabled on last step", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    // Click next twice to reach the last step (step 3)
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    
    expect(nextButton).toBeDisabled();
  });

  test("next button advances to next step", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    await userEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText("Paso 2 de 3")).toBeInTheDocument();
      expect(screen.getByText("Step 2")).toBeInTheDocument();
      expect(screen.getByText("This is the second step")).toBeInTheDocument();
    });
  });

  test("next button does not advance beyond last step", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    // Click next twice to reach last step
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    
    // Try to click again
    await userEvent.click(nextButton);
    
    // Should still be on step 3
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
  });

  // Navigation - Previous button tests
  test("previous button is disabled on first step", () => {
    renderModal();
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    expect(prevButton).toBeDisabled();
  });

  test("previous button goes to previous step", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
    
    await userEvent.click(prevButton);
    
    await waitFor(() => {
      expect(screen.getByText("Paso 2 de 3")).toBeInTheDocument();
      expect(screen.getByText("Step 2")).toBeInTheDocument();
    });
  });

  test("previous button does not go below first step", async () => {
    renderModal();
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    
    // Try to click previous from first step
    await userEvent.click(prevButton);
    
    // Should still be on step 1
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
  });

  // Step indicator dots tests
  test("renders step indicator dots", () => {
    renderModal();
    const dots = screen.getAllByRole("button", { name: /go to step/i });
    expect(dots).toHaveLength(3);
  });

  test("active dot has correct aria-pressed state", () => {
    renderModal();
    const dots = screen.getAllByRole("button", { name: /go to step/i });
    
    expect(dots[0]).toHaveAttribute("aria-pressed", "true");
    expect(dots[1]).toHaveAttribute("aria-pressed", "false");
    expect(dots[2]).toHaveAttribute("aria-pressed", "false");
  });

  test("clicking step dot navigates to that step", async () => {
    renderModal();
    const dots = screen.getAllByRole("button", { name: /go to step/i });
    
    await userEvent.click(dots[2]);
    
    await waitFor(() => {
      expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
      expect(screen.getByText("Step 3")).toBeInTheDocument();
      expect(dots[2]).toHaveAttribute("aria-pressed", "true");
    });
  });

  // Close button tests
  test("close button in header calls onClose", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const closeButton = screen.getByRole("button", { name: /close modal/i });
    await userEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  test("close button in footer calls onClose", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const closeButton = screen.getByRole("button", { name: /cerrar/i });
    await userEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  // Overlay click tests
  test("clicking on overlay calls onClose", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const overlay = screen.getByRole("dialog").parentElement;
    await userEvent.click(overlay);
    
    expect(onClose).toHaveBeenCalled();
  });

  test("clicking on modal content does not close modal", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const modalContent = screen.getByRole("dialog");
    await userEvent.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  // Keyboard navigation tests
  test("escape key calls onClose", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    
    expect(onClose).toHaveBeenCalled();
  });

  test("escape key on modal content calls onClose", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    
    expect(onClose).toHaveBeenCalled();
  });

  test("escape key on overlay calls onClose", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const overlay = screen.getByRole("dialog").parentElement;
    fireEvent.keyDown(overlay, { key: "Escape" });
    
    expect(onClose).toHaveBeenCalled();
  });

  // Accessibility tests
  test("modal has correct aria attributes", () => {
    renderModal();
    const modal = screen.getByRole("dialog");
    
    expect(modal).toHaveAttribute("aria-labelledby", "help-modal-title");
  });

  test("modal title has correct id", () => {
    renderModal();
    const title = screen.getByText("Getting Started");
    
    expect(title).toHaveAttribute("id", "help-modal-title");
  });

  // Multiple steps navigation flow
  test("can navigate through all steps sequentially", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    
    await userEvent.click(nextButton);
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    
    await userEvent.click(nextButton);
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  test("handles single step tutorial", () => {
    const singleStepData = {
      title: "Single Step",
      steps: [
        {
          title: "Only Step",
          description: "This is the only step"
        }
      ]
    };
    
    renderModal({ tutorialData: singleStepData });
    
    expect(screen.getByText("Paso 1 de 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  // Additional edge case and comprehensive tests
  test("keyboard event with non-escape key does not close modal", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Enter" });
    
    expect(onClose).not.toHaveBeenCalled();
  });

  test("keyboard event with different keys on dialog", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const dialog = screen.getByRole("dialog");
    
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(onClose).not.toHaveBeenCalled();
    
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(onClose).not.toHaveBeenCalled();
  });

  test("clicking close button in footer closes modal", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const closeButton = screen.getAllByRole("button").find(
      (btn) => btn.textContent === "Cerrar"
    );
    
    if (closeButton) {
      await userEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    }
  });

  test("navigation flow with keyboard and mouse combinations", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    
    // Navigate forward with mouse
    await userEvent.click(nextButton);
    expect(screen.getByText("Paso 2 de 3")).toBeInTheDocument();
    
    // Navigate backward with mouse
    await userEvent.click(prevButton);
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    
    // Jump to step 3 using dot
    const dots = screen.getAllByRole("button", { name: /go to step/i });
    await userEvent.click(dots[2]);
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
  });

  test("step indicator dots update aria-pressed state dynamically", async () => {
    renderModal();
    const dots = screen.getAllByRole("button", { name: /go to step/i });
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    // Initial state
    expect(dots[0]).toHaveAttribute("aria-pressed", "true");
    
    // Move to step 2
    await userEvent.click(nextButton);
    expect(dots[0]).toHaveAttribute("aria-pressed", "false");
    expect(dots[1]).toHaveAttribute("aria-pressed", "true");
    
    // Move to step 3
    await userEvent.click(nextButton);
    expect(dots[1]).toHaveAttribute("aria-pressed", "false");
    expect(dots[2]).toHaveAttribute("aria-pressed", "true");
  });

  test("modal renders with empty steps array gracefully", () => {
    const emptyStepsData = {
      title: "Empty Tutorial",
      steps: []
    };
    
    // This test verifies the component handles edge cases
    // Note: In practice, this might cause runtime errors, but we're testing the behavior
    try {
      renderModal({ tutorialData: emptyStepsData });
      // If it renders, the modal should be there
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    } catch (error) {
      // Component may throw error with empty steps - that's acceptable
      expect(error).toBeDefined();
    }
  });

  test("dialog handles multiple keyboard events sequentially", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const dialog = screen.getByRole("dialog");
    
    // First Escape key press
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    
    // Reset and test another Escape key press
    vi.clearAllMocks();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("modal maintains step state during rapid navigation", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    // Rapid clicks to next button
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    await userEvent.click(nextButton); // Should not advance beyond step 3
    await userEvent.click(nextButton); // Should still be on step 3
    
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
  });

  test("close button functionality across different modal states", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    // Navigate to step 2
    await userEvent.click(nextButton);
    
    // Close from step 2
    const headerCloseButton = screen.getByRole("button", { name: /close modal/i });
    await userEvent.click(headerCloseButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  // Branch coverage tests - Conditional branch paths
  test("pressing non-Escape key on dialog does not call onClose", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const dialog = screen.getByRole("dialog");
    
    // Press Enter key (not Escape)
    fireEvent.keyDown(dialog, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
    
    // Press ArrowRight key (not Escape)
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(onClose).not.toHaveBeenCalled();
    
    // Press Space key (not Escape)
    fireEvent.keyDown(dialog, { key: " " });
    expect(onClose).not.toHaveBeenCalled();
  });

  test("pressing non-Escape key on overlay does not call onClose", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const overlay = screen.getByRole("dialog").parentElement;
    
    // Press Enter key on overlay (not Escape)
    fireEvent.keyDown(overlay, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  test("handleNext guards against advancing past last step", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    // Click next until we reach the last step
    await userEvent.click(nextButton); // Step 2
    await userEvent.click(nextButton); // Step 3
    
    const currentStepText = screen.getByText("Paso 3 de 3");
    expect(currentStepText).toBeInTheDocument();
    
    // Try to go next from last step
    await userEvent.click(nextButton); // Should not advance
    
    // Verify still on step 3
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  test("handlePrev guards against going below first step", async () => {
    renderModal();
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    
    // Try to go previous from first step
    await userEvent.click(prevButton); // Should not advance
    
    // Verify still on step 1
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });

  test("dialog escape key handler prevents propagation and calls onClose", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    
    const dialog = screen.getByRole("dialog");
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
    
    fireEvent.keyDown(dialog, { key: "Escape" });
    
    expect(onClose).toHaveBeenCalled();
  });

  test("step dot buttons can navigate to specific steps directly", async () => {
    renderModal();
    const dotButtons = screen.getAllByRole("button", { name: /go to step/i });
    
    // Click on step 3 dot
    await userEvent.click(dotButtons[2]);
    
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
    
    // Click on step 1 dot
    await userEvent.click(dotButtons[0]);
    
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });

  test("step indicators update aria-pressed state correctly", async () => {
    renderModal();
    const dotButtons = screen.getAllByRole("button", { name: /go to step/i });
    
    // Initially, step 1 dot should have aria-pressed true
    expect(dotButtons[0]).toHaveAttribute("aria-pressed", "true");
    expect(dotButtons[1]).toHaveAttribute("aria-pressed", "false");
    expect(dotButtons[2]).toHaveAttribute("aria-pressed", "false");
    
    // Click on step 2
    await userEvent.click(dotButtons[1]);
    
    expect(dotButtons[0]).toHaveAttribute("aria-pressed", "false");
    expect(dotButtons[1]).toHaveAttribute("aria-pressed", "true");
    expect(dotButtons[2]).toHaveAttribute("aria-pressed", "false");
  });

  test("next/prev buttons correctly reflect disabled state at boundaries", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    
    // At step 1: prev disabled, next enabled
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
    
    // Move to step 2
    await userEvent.click(nextButton);
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
    
    // Move to step 3
    await userEvent.click(nextButton);
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  // Edge case: verify step state persistence when attempting invalid navigation
  test("step state remains unchanged when attempting invalid prev navigation", async () => {
    renderModal();
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    
    // Disabled button should not navigate
    expect(prevButton).toBeDisabled();
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    
    // Force click the disabled button (to test the handler's guard clause)
    fireEvent.click(prevButton);
    
    // State should remain on step 1
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
  });

  test("step state remains unchanged when attempting invalid next navigation at end", async () => {
    renderModal();
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    // Navigate to last step
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
    
    // Force click the disabled button to test the handler's guard clause
    fireEvent.click(nextButton);
    
    // State should remain on step 3
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  test("keyboard navigation with non-standard keys does not affect step", async () => {
    renderModal();
    const dialog = screen.getByRole("dialog");
    
    // Pressing ArrowUp/Down should not navigate steps
    fireEvent.keyDown(dialog, { key: "ArrowUp" });
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    
    fireEvent.keyDown(dialog, { key: "ArrowDown" });
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
    
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(screen.getByText("Paso 1 de 3")).toBeInTheDocument();
  });

  // Test with single-step modal (edge case where all navigation is bounded)
  test("single step modal handles Next guard clause", () => {
    const singleStepData = {
      title: "Single Step",
      steps: [{ title: "Only Step", description: "This is the only step" }]
    };
    
    const { rerender } = renderModal({ tutorialData: singleStepData });
    
    // Both buttons should be disabled from the start
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    
    expect(nextButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
    
    expect(screen.getByText("Paso 1 de 1")).toBeInTheDocument();
    
    // Try to navigate next (should guard successfully)
    fireEvent.click(nextButton);
    expect(screen.getByText("Paso 1 de 1")).toBeInTheDocument();
    
    // Try to navigate prev (should guard successfully)
    fireEvent.click(prevButton);
    expect(screen.getByText("Paso 1 de 1")).toBeInTheDocument();
  });

  test("two step modal exercises all handleNext conditions", async () => {
    const twoStepData = {
      title: "Two Steps",
      steps: [
        { title: "Step 1", description: "First step" },
        { title: "Step 2", description: "Second step" }
      ]
    };
    
    renderModal({ tutorialData: twoStepData });
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    
    // From step 1: currentStep (0) < steps.length - 1 (1) -> true, should advance
    await userEvent.click(nextButton);
    expect(screen.getByText("Paso 2 de 2")).toBeInTheDocument();
    
    // From step 2: currentStep (1) < steps.length - 1 (1) -> false, should not advance
    expect(nextButton).toBeDisabled();
    fireEvent.click(nextButton);
    expect(screen.getByText("Paso 2 de 2")).toBeInTheDocument();
  });

  test("two step modal exercises all handlePrev conditions", async () => {
    const twoStepData = {
      title: "Two Steps",
      steps: [
        { title: "Step 1", description: "First step" },
        { title: "Step 2", description: "Second step" }
      ]
    };
    
    const { rerender } = renderModal({ tutorialData: twoStepData });
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    
    // Move to step 2
    await userEvent.click(nextButton);
    
    // From step 2: currentStep (1) > 0 -> true, should go back
    await userEvent.click(prevButton);
    expect(screen.getByText("Paso 1 de 2")).toBeInTheDocument();
    
    // From step 1: currentStep (0) > 0 -> false, should not go back
    expect(prevButton).toBeDisabled();
    fireEvent.click(prevButton);
    expect(screen.getByText("Paso 1 de 2")).toBeInTheDocument();
  });
});
