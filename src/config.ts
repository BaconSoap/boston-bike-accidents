module bostonBiking {
	export var config: MapConfig = {
		provider: MapProvider.Stamen
	};

	export interface MapConfig {
		provider: MapProvider;
	}

	export enum MapProvider {
		Mapbox, Stamen
	}
}
