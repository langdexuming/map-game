/**
 * Explorer 视图: 显示全部已解锁城市, 灰显未解锁
 * @author make java
 * @since 2026-05-01
 */
import { Node } from 'cc';
import { MapViewVO } from '../../api/types';
import { MapViewRenderer } from './MapViewRenderer';

export class ExplorerRenderer implements MapViewRenderer {

    render(nodeContainer: Node, routeContainer: Node, data: MapViewVO): void {
        routeContainer.removeAllChildren();
        console.log('[ExplorerRenderer] cities=', data.cities.length);
    }
}
