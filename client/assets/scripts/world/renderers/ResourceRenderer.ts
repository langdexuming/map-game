/**
 * Resource 视图: 在节点上叠加资源点 (待 S5 数据)
 * @author make java
 * @since 2026-05-01
 */
import { Node } from 'cc';
import { MapViewVO } from '../../api/types';
import { MapViewRenderer } from './MapViewRenderer';

export class ResourceRenderer implements MapViewRenderer {

    render(nodeContainer: Node, routeContainer: Node, data: MapViewVO): void {
        routeContainer.removeAllChildren();
        console.log('[ResourceRenderer] layers=', data.layers.length);
    }
}
