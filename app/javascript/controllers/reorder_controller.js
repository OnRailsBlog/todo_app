import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="reorder"
export default class extends Controller {
  static classes = ["activeDropzone", "activeItem", "dropTarget"];

  dragstart(event) {
    this.element.classList.add(...this.activeDropzoneClasses);
    const draggableItem = getDataNode(event.target);
    draggableItem.classList.add(...this.activeItemClasses);
    event.dataTransfer.setData(
      "application/drag-key",
      draggableItem.dataset.reorderableId
    );
    event.dataTransfer.effectAllowed = "move";
  }

  dragover(event) {
    event.preventDefault();
    return true;
  }

  dragenter(event) {
    let parent = getDataNode(event.target);
    if (parent != null && parent.dataset.reorderableId != null) {
      parent.classList.add(...this.dropTargetClasses);
      for (const child of parent.children) {
        child.classList.add("pointer-events-none");
      }
      event.preventDefault();
    }
  }

  dragleave(event) {
    let parent = getDataNode(event.target);
    if (parent != null && parent.dataset.reorderableId != null) {
      parent.classList.remove(...this.dropTargetClasses);
      for (const child of parent.children) {
        child.classList.remove("pointer-events-none");
      }

      event.preventDefault();
    }
  }

  drop(event) {
    this.element.classList.remove(...this.activeDropzoneClasses);

    const dropTarget = getDataNode(event.target);
    dropTarget.classList.remove(...this.dropTargetClasses);
    for (const child of dropTarget.children) {
      child.classList.remove("pointer-events-none");
    }

    var data = event.dataTransfer.getData("application/drag-key");
    const draggedItem = this.element.querySelector(
      `[data-reorderable-id='${data}']`
    );

    if (draggedItem) {
      draggedItem.classList.remove(...this.activeItemClasses);

      if (
        dropTarget.compareDocumentPosition(draggedItem) &
        Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        let result = dropTarget.insertAdjacentElement(
          "beforebegin",
          draggedItem
        );
      } else if (
        dropTarget.compareDocumentPosition(draggedItem) &
        Node.DOCUMENT_POSITION_PRECEDING
      ) {
        let result = dropTarget.insertAdjacentElement("afterend", draggedItem);
      }

      let formData = new FormData();
      formData.append(
        "reorderable_target_id",
        dropTarget.dataset.reorderableId
      );

      fetch(draggedItem.dataset.reorderablePath, {
        body: formData,
        method: "PATCH",
        credentials: "include",
        dataType: "script",
        headers: {
          "X-CSRF-Token": getMetaValue("csrf-token"),
        },
        redirect: "manual",
      });
    }
    event.preventDefault();
  }

  dragend(event) {
    this.element.classList.remove(...this.activeDropzoneClasses);
  }
}

function getDataNode(node) {
  return node.closest("[data-reorderable-id]");
}

function getMetaValue(name) {
  const element = document.head.querySelector(`meta[name="${name}"]`);
  return element.getAttribute("content");
}
