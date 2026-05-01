/**
 * Team 视图: 显示当前队伍位置/巡逻路径 (待 S2 数据)
 * @author make java
 * @since 2026-05-01
 */
import { Node } from 'cc';
import { MapViewVO } from '../../api/types';
import { MapViewRenderer } from './MapViewRenderer';

export class TeamRenderer implements MapViewRenderer {

    render(nodeContainer: Node, routeContainer: Node, data: MapViewVO): void {
        routeContainer.removeAllChildren();
        console.log('[TeamRenderer] cities=', data.cities.length);
    }
}
