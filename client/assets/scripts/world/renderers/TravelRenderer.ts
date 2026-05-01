/**
 * ★ Travel 视图: 高亮 5 类载具的航线 (待 S4 数据)
 *  - PLANE   黄虚线
 *  - SHIP    蓝实线
 *  - TRAIN   棕点线
 *  - TRUCK   灰直线
 *  - FOOT    绿虚线
 * @author make java
 * @since 2026-05-01
 */
import { Color, Graphics, Node, Vec3, instantiate } from 'cc';
import { MapViewVO } from '../../api/types';
import { GameStore } from '../../core/GameStore';
import { MapViewRenderer } from './MapViewRenderer';

export class TravelRenderer implements MapViewRenderer {

    private static COLOR: Record<string, Color> = {
        ROUTE_PLANE: new Color(255, 215, 102),
        ROUTE_SHIP: new Color(80, 160, 240),
        ROUTE_TRAIN: new Color(160, 100, 60),
        ROUTE_TRUCK: new Color(160, 160, 160),
        ROUTE_FOOT: new Color(100, 200, 100),
    };

    render(nodeContainer: Node, routeContainer: Node, data: MapViewVO): void {
        routeContainer.removeAllChildren();
        const gNode = new Node('TravelLines');
        const g = gNode.addComponent(Graphics);
        for (const item of data.layers) {
            const from = GameStore.findCity(item.fromCityId);
            const to = GameStore.findCity(item.toCityId);
            if (!from || !to) {
                continue;
            }
            const c = TravelRenderer.COLOR[item.layerType] ?? Color.WHITE;
            g.strokeColor = c;
            g.lineWidth = 2;
            g.moveTo(from.lng * 8, from.lat * 8);
            g.lineTo(to.lng * 8, to.lat * 8);
            g.stroke();
        }
        routeContainer.addChild(gNode);
    }
}
