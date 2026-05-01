/**
 * 视图渲染器统一接口
 * @author make java
 * @since 2026-05-01
 */
import { Node } from 'cc';
import { MapViewVO } from '../../api/types';

export interface MapViewRenderer {

    /**
     * 渲染某种视图
     * @param nodeContainer 节点容器
     * @param routeContainer 路径容器
     * @param data 视图数据
     */
    render(nodeContainer: Node, routeContainer: Node, data: MapViewVO): void;
}
