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
    event.dataTransfer.setData("startX", event.pageX);
    event.dataTransfer.setData("startY", event.pageY);
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

  async drop(event) {
    this.element.classList.remove(...this.activeDropzoneClasses);

    const dropTarget = getDataNode(event.target);
    dropTarget.classList.remove(...this.dropTargetClasses);
    for (const child of dropTarget.children) {
      child.classList.remove("pointer-events-none");
    }

    var data = event.dataTransfer.getData("application/drag-key");
    let startX = event.dataTransfer.getData("startX");
    let startY = event.dataTransfer.getData("startY");
    const draggedItem = this.element.querySelector(
      `[data-reorderable-id='${data}']`
    );

    if (draggedItem) {
      draggedItem.classList.remove(...this.activeItemClasses);
      let startPosition = draggedItem.getBoundingClientRect();
      let dropTargetPosition = dropTarget.getBoundingClientRect();
      let direction = Math.sign(startPosition.top - dropTargetPosition.top);
      let draggedPostDragY = event.pageY - startY;
      let draggedPostDragX = event.pageX - startX;

      draggedItem.style = `transform: translate(${draggedPostDragX}px, ${draggedPostDragY}px);`;
      draggedItem.animate(
        [
          {
            transform: `translate(${
              dropTargetPosition.x - startPosition.x
            }px, ${dropTargetPosition.y - startPosition.y}px)`,
          },
        ],
        {
          duration: 200,
          easing: "ease-out",
        }
      );
      let distance = direction * dropTargetPosition.height;
      var animateMiddleRows = false;
      for (const child of this.element.children) {
        if (child == dropTarget) {
          animateMiddleRows = !animateMiddleRows;
          child.animate([{ transform: `translateY(${distance}px)` }], {
            duration: 200,
            easing: "ease-in-out",
          });
        } else if (child == draggedItem) {
          animateMiddleRows = !animateMiddleRows;
        } else {
          if (animateMiddleRows) {
            child.animate([{ transform: `translateY(${distance}px)` }], {
              duration: 200,
              easing: "ease-in-out",
            });
          }
        }
      }
      await Promise.all(
        draggedItem.getAnimations().map((animation) => animation.finished)
      );
      draggedItem.style = "";
      this.moveItems(draggedItem, dropTarget);
    }
    event.preventDefault();
  }

  dragend(event) {
    this.element.classList.remove(...this.activeDropzoneClasses);
  }

  async moveUp(event) {
    let parent = getDataNode(event.target);
    if (
      parent.previousSibling.dataset != null &&
      parent.previousSibling.dataset.reorderableId != null
    ) {
      this.animateSwitch(parent, parent.previousSibling);
      await Promise.all(
        parent.getAnimations().map((animation) => animation.finished)
      );
      this.moveItems(parent, parent.previousSibling);
    }
    event.preventDefault();
  }

  async moveDown(event) {
    let parent = getDataNode(event.target);
    if (
      parent.nextSibling.dataset != null &&
      parent.nextSibling.dataset.reorderableId != null
    ) {
      this.animateSwitch(parent.nextSibling, parent);
      await Promise.all(
        parent.getAnimations().map((animation) => animation.finished)
      );
      this.moveItems(parent, parent.nextSibling);
    }

    event.preventDefault();
  }

  moveItems(item, target) {
    if (
      target.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      let result = target.insertAdjacentElement("beforebegin", item);
    } else if (
      target.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_PRECEDING
    ) {
      let result = target.insertAdjacentElement("afterend", item);
    }

    let formData = new FormData();
    formData.append("reorderable_target_id", target.dataset.reorderableId);

    fetch(item.dataset.reorderablePath, {
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

  animateSwitch(from, to) {
    from.animate([{ transform: `translateY(-${from.clientHeight}px)` }], {
      duration: 300,
      easing: "ease-in-out",
    });

    to.animate([{ transform: `translateY(${to.clientHeight}px)` }], {
      duration: 300,
      easing: "ease-in-out",
    });
  }
}

function getDataNode(node) {
  return node.closest("[data-reorderable-id]");
}

function getMetaValue(name) {
  const element = document.head.querySelector(`meta[name="${name}"]`);
  return element.getAttribute("content");
}
