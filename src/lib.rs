use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen(start)]
pub fn main_js() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn repair(jsonish: String) {
    console::log_1(&JsValue::from(format!("foobar was called with: {jsonish}")));
}
