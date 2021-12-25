import { Component, HostListener, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
	selector: 'app-checkbox',
	templateUrl: './checkbox.component.html',
	styleUrls: ['./checkbox.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: CheckboxComponent
		}
	]
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {

	value: boolean = false;
	disabled: boolean = false;

	onChange = (value) => {};
	onTouched = () => {};

	constructor() { }

	ngOnInit(): void {
	}

	@HostListener('click')
	toggle() {
		this.value = !this.value;
		this.onChange(this.value);
	}

	writeValue(value: any) {
		this.value = value;
	}

	registerOnChange(fn) {
		this.onChange = fn;
	}

	registerOnTouched(fn) {
		this.onTouched = fn;
	}

	setDisabledState(disabled: boolean) {
		this.disabled = disabled;
	}

}
