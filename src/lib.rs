// Adapted from Chumsky's JSON example:
// https://github.com/zesterer/chumsky/blob/b757ad0b00f1f9207141e106ec55d2b4c2e0257c/examples/json.rs

use chumsky::prelude::*;
use wasm_bindgen::prelude::*;
use web_sys::console;
use serde_json::{to_string, Value as JsonValue, Map};

#[wasm_bindgen(start)]
pub fn main_js() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn repair(jsonish: String) -> JsValue {
    let parsed = jsonish_parser().parse(&jsonish).into_output();
    match parsed {
        Some(serialized) => match to_string(&serialized) {
            Ok(json) => JsValue::from_str(&json),
            Err(_) => {
                console::log_1(&"Unexpected error: JSON recover-parse succeeded but serialization failed.".into());
                JsValue::null()
            },
        } ,
        None => {
            console::log_1(&"Failed to recover JSON; it was even more broken than usual.".into());
            JsValue::null()
        }
    }
}

#[derive(Default)]
struct CollectableMap(Map<String, JsonValue>);

impl chumsky::container::Container<(String, JsonValue)> for CollectableMap {
    fn push(&mut self, item: (String, JsonValue)) {
        self.0.insert(item.0, item.1);
    }
}

fn jsonish_parser<'a>() -> impl Parser<'a, &'a str, JsonValue, extra::Err<Rich<'a, char>>> {
    recursive(|value| {
        let digits = text::digits(10).to_slice();

        let frac = just('.').then(digits);

        let exp = just('e')
            .or(just('E'))
            .then(one_of("+-").or_not())
            .then(digits);

        let number = just('-')
            .or_not()
            .then(text::int(10))
            .then(frac.or_not())
            .then(exp.or_not())
            .to_slice()
            .map(|s: &str| s.parse().unwrap())
            .boxed();

        let escape = just('\\')
            .then(choice((
                just('\\'),
                just('/'),
                just('"'),
                just('b').to('\x08'),
                just('f').to('\x0C'),
                just('n').to('\n'),
                just('r').to('\r'),
                just('t').to('\t'),
                just('u').ignore_then(text::digits(16).exactly(4).to_slice().validate(
                    |digits, e, emitter| {
                        char::from_u32(u32::from_str_radix(digits, 16).unwrap()).unwrap_or_else(
                            || {
                                emitter.emit(Rich::custom(e.span(), "invalid unicode character"));
                                '\u{FFFD}' // unicode replacement character
                            },
                        )
                    },
                )),
            )))
            .ignored()
            .boxed();

        let double_quote_string = none_of("\\\"")
            .ignored()
            .or(escape.clone())
            .repeated()
            .to_slice()
            .map(ToString::to_string)
            .map(|s| s.replace("\\", ""))
            .delimited_by(just('"'), just('"'))
            .boxed();

        let single_quote_string = none_of("\\'")
            .ignored()
            .or(escape.clone())
            .repeated()
            .to_slice()
            .map(ToString::to_string)
            .delimited_by(just('\''), just('\''))
            .boxed();

        let undelimited_key = any::<&'a str, extra::Err<Rich<'a, char>>>()
            .filter(|c: &char| c.is_ascii_alphabetic())
            .repeated()
            .at_least(1)
            .collect::<String>()
            .boxed();

        let array = value
            .clone()
            .separated_by(just(',').padded().recover_with(skip_then_retry_until(
                any().ignored(),
                one_of(",]").ignored(),
            )))
            .allow_trailing()
            .collect()
            .padded()
            .delimited_by(
                just('['),
                just(']')
                    .ignored()
                    .recover_with(via_parser(end()))
                    .recover_with(skip_then_retry_until(any().ignored(), end())),
            )
            .boxed();

        let js_like_identifier = any()
            .filter(|c: &char| c.is_ascii_alphabetic())
            .repeated()
            .at_least(1)
            .collect::<String>();

        let member = undelimited_key.or(double_quote_string.clone()).or(single_quote_string.clone()).then_ignore(just(':').padded()).then(value);
        let object = member
            .clone()
            .separated_by(just(',').padded().recover_with(skip_then_retry_until(
                any().ignored(),
                one_of(",}").ignored(),
            )))
            .collect::<CollectableMap>()
            .padded()
            .delimited_by(
                just('{'),
                just('}')
                    .ignored()
                    .recover_with(via_parser(end()))
                    .recover_with(skip_then_retry_until(any().ignored(), end())),
            )
            .boxed()
            .map(|collectable_map| collectable_map.0);

        choice((
            just("null").to(JsonValue::Null),
            just("true").to(JsonValue::Bool(true)),
            just("false").to(JsonValue::Bool(false)),
            number.map(JsonValue::Number),
            double_quote_string.map(JsonValue::String),
            single_quote_string.map(JsonValue::String),
            js_like_identifier.map(JsonValue::String),
            array.map(JsonValue::Array),
            object.map(JsonValue::Object),
        ))
        .recover_with(skip_then_retry_until(
            any().ignored(),
            one_of(",]}").ignored(),
        ))
        .padded()
    })
}
