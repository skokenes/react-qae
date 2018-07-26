import { from } from "rxjs";
import {
  componentFromStreamWithConfig,
  mapPropsStreamWithConfig
} from "recompose";

const config = {
  fromESObservable: from,
  toESObservable: function toESObservable(stream) {
    return stream;
  }
};

const componentFromStream = componentFromStreamWithConfig(config);
const mapPropsStream = mapPropsStreamWithConfig(config);

export { componentFromStream, mapPropsStream };
