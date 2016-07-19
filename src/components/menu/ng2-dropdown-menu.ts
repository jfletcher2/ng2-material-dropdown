import {
    Component,
    ElementRef,
    Renderer,
    ContentChildren,
    QueryList,
    forwardRef,
    Inject
} from '@angular/core';

import { Ng2MenuItem } from '../menu-item/ng2-menu-item';
import { Ng2Dropdown } from '../dropdown/ng2-dropdown';
import { Ng2DropdownMenuComponent } from './ng2-dropdown-menu.d';

import { animations } from './animations';
import { ACTIONS } from './actions';

@Component({
    moduleId: module.id,
    selector: 'ng2-dropdown-menu',
    styles: [require('./style.scss').toString()],
    template: require('./template.html'),
    animations
})
export class Ng2DropdownMenu implements Ng2DropdownMenuComponent {

    /**
     * @name items
     * @type {QueryList<Ng2MenuItem>}
     */
    @ContentChildren(Ng2MenuItem) public items: QueryList<Ng2MenuItem>;

    /**
     * @name state
     * @type {{isVisible: boolean, toString: (function(): string)}}
     */
    public state = {
        isVisible: false,

        /**
         * @returns current state as a string visible|hidden
         * @returns {string|string}
         */
        toString: (): string => {
            return this.state.isVisible ? 'visible' : 'hidden';
        }
    };

    constructor(@Inject(forwardRef(() => Ng2Dropdown)) private dropdown: Ng2Dropdown,
                private element: ElementRef,
                private renderer: Renderer) {}

    /**
     * @name show
     * @shows menu and selects first item
     */
    public show(): void {
        // update state
        this.state.isVisible = true;

        // focus element
        this.focusMenuElement();

        // select first item
        this.dropdown.state.select(this.items.first, false);
    }

    /**
     * @name hide
     * @desc hides menu
     */
    public hide(): void {
        this.state.isVisible = false;

        // reset selected item state
        this.dropdown.state.unselect();
    }

    /**
     * @name updatePosition
     * @desc updates the menu position every time it is toggled
     * @param position {ClientRect}
     */
    public updatePosition(position: ClientRect): void {
        const element = this.getMenuElement(),
            top = `${position.top - 15}px`,
            left = `${position.left - 5}px`;

        this.renderer.setElementStyle(element, 'top', top);
        this.renderer.setElementStyle(element, 'left', left);
    }

    /**
     * @name handleKeypress
     * @desc executes functions on keyPress based on the key pressed
     * @param $event
     */
    public handleKeypress($event): void {
        const key = $event.keyCode,
            items = this.items.toArray(),
            index = items.indexOf(this.dropdown.state.selectedItem);

        if (!ACTIONS.hasOwnProperty(key)) {
            return;
        }

        ACTIONS[key].call(this, index, items, this.dropdown.state);

        $event.preventDefault();
    }

    /**
     * @name getMenuElement
     * @returns {Element}
     */
    private getMenuElement(): Element {
        return this.element.nativeElement.children[0];
    }

    /**
     * @name focusMenuElement
     * @desc calls focus method on the menu
     */
    private focusMenuElement(): void {
        this.renderer.invokeElementMethod(this.getMenuElement(), 'focus', []);
    }

    ngOnInit() {
        // append menu element to the body
        const body = document.querySelector('body');
        body.appendChild(this.element.nativeElement);
    }
}
