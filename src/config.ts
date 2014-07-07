module bostonBiking {
	export var config: MapConfig = {
		provider: MapProvider.Stamen,
		dataUrl: '/data/bikes_raw.json',
		filterUrl: '/data/generated_filters.json'
	};

	export interface MapConfig {
		provider: MapProvider;
		dataUrl: string;
		filterUrl: string;
	}

	export enum MapProvider {
		Mapbox, Stamen
	}
}
