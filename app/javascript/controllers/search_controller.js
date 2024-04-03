import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="search"
export default class extends Controller {
  static values = { url: String };

  search(event) {
    Turbo.visit(`${this.urlValue}?${event.target.name}=${event.target.value}`);
  }
}
