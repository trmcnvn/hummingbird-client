import { computed } from "@ember-decorators/object";

/**
 * Allow `ember-parachute`'s Mixin to be applied to classes
 * without the weird .extend syntax.
 *
 * @TODO: Instead of re-implementing the code, can we just apply the mixin?
 */
import QueryParams from 'ember-parachute';

const HAS_PARACHUTE = '__has_parachute__';
const PARACHUTE_META = '__parachute_meta__';

export default paramsInstance => (
  TargetClass => {
    const { queryParams, defaultValues, qpMapForController } = paramsInstance._generateMeta();
    const keys = Object.keys(queryParams);

    return class extends TargetClass {
      [HAS_PARACHUTE] = true;
      [PARACHUTE_META] = paramsInstance._generateMeta();
      queryParams = qpMapForController;

      @computed(...keys)
      get allQueryParams() {
        return QueryParams.queryParamsFor(this);
      }

      @computed(...keys, `${PARACHUTE_META}.queryParamsArray.@each.defaultValue`)
      get queryParamsState() {
        return QueryParams.stateFor(this);
      }

      constructor() {
        super(...arguments);
        Object.keys(defaultValues).forEach(key => {
          this[key] = defaultValues[key];
        });
      }

      queryParamsDidChange() {
        if (typeof super.queryParamsDidChange === 'function') {
          super.queryParamsDidChange(...arguments);
        }
      }

      setup() {
        if (typeof super.setup === 'function') {
          super.setup(...arguments);
        }
      }

      reset() {
        if (typeof super.reset === 'function') {
          super.reset(...arguments);
        }
      }

      resetQueryParams(params = []) {
        QueryParams.resetParamsFor(this, params);
      }

      setDefaultQueryParamValue(key, defaultValue) {
        QueryParams.setDefaultValue(this, key, defaultValue);
      }
    }
  }
);
