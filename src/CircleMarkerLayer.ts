///<reference path="../typings/tsd.d.ts" />

module bostonBiking {
	export class CircleMarkerLayer {
		private _baseData: any;
		private _filterFunction: (data: any) => boolean;
		private _dirty: boolean;

		private _markers: Array<L.CircleMarker>;
		private _markerLayer: L.FeatureGroup<L.CircleMarker>;

		private static _visibleMarker = {
			radius: 4,
			fillOpacity: 0.7,
			color: '#121212',
			fillColor: '#990909',
			opacity: 1,
			weight: 0.5,
			clickable: true
		};

		private static _invisibleMarker = {
			radius: 0,
			fillOpacity: 0,
			opacity: 0,
			weight: 0,
			clickable: false
		};

		public constructor(baseData: any) {
			this._markers = [];
			this.SetBaseData(baseData);
		}

		public SetBaseData(baseData: any) {
			this._baseData = baseData;
			this._dirty = true;
			this.CreateMarkers();
		}

		public CreateMarkers() {
			this._markers = [];

			for (var i = 0; i < this._baseData.features.length; i++) {
				var feature = this._baseData.features[i];
				var marker = <any>L.circleMarker(<any>[feature.geometry.coordinates[1], feature.geometry.coordinates[0]], CircleMarkerLayer._visibleMarker);
				marker.properties = feature.properties;
				this._markers.push(marker);
			}
			this._markerLayer = L.featureGroup(this._markers);
		}

		public BindMap(map: L.Map) {
			map.addLayer(this._markerLayer);
			map.fitBounds(this._markerLayer.getBounds());
		}

		public SetFilter(filter: (data: any) => boolean) {
			this._filterFunction = filter;
			this._dirty = true;
		}

		public RunFilter() {
			if (!this._dirty) {
				return;
			}

			for (var i = 0; i < this._markers.length; i++) {
				var marker = <any>this._markers[i];
				if (!this._filterFunction(marker)) {
					(<L.CircleMarker>marker).setStyle(CircleMarkerLayer._invisibleMarker);
				} else {
					(<L.CircleMarker>marker).setStyle(CircleMarkerLayer._visibleMarker);
				}
			}

			this._dirty = false;
		}

		public getBounds() {
			return this._markerLayer.getBounds();
		}
	}
}
