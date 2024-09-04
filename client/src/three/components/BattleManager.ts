import { Position } from "@/types/Position";
import { getWorldPositionForHex } from "@/ui/utils/utils";
import { ID } from "@bibliothecadao/eternum";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { GUIManager } from "../helpers/GUIManager";
import { BattleSystemUpdate } from "../systems/types";
import InstancedModel from "./InstancedModel";
import { LabelManager } from "./LabelManager";

const MODEL_PATH = "models/buildings/fishery.glb";
const LABEL_PATH = "textures/army_label.png";
const MAX_INSTANCES = 1000;

export class BattleManager {
  private scene: THREE.Scene;
  private instancedModel: InstancedModel | undefined;
  private dummy: THREE.Object3D = new THREE.Object3D();
  loadPromise: Promise<void>;
  battles: Battles = new Battles();

  private labels: Map<ID, THREE.Points> = new Map();
  private labelManager: LabelManager;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.labelManager = new LabelManager(LABEL_PATH);

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        MODEL_PATH,
        (gltf) => {
          const model = gltf.scene as THREE.Group;
          this.instancedModel = new InstancedModel(model, MAX_INSTANCES);
          this.instancedModel.setCount(0);
          this.scene.add(this.instancedModel.group);
          resolve();
        },
        undefined,
        (error) => {
          console.error("An error occurred while loading the model:", error);
          reject(error);
        },
      );
    });

    const createBattleFolder = GUIManager.addFolder("Create Battle");
    const createBattleParams = { entityId: 0, col: 0, row: 0 };

    createBattleFolder.add(createBattleParams, "entityId").name("Entity ID");
    createBattleFolder.add(createBattleParams, "col").name("Column");
    createBattleFolder.add(createBattleParams, "row").name("Row");
    createBattleFolder
      .add(
        {
          addBattle: () => {
            this.addBattle(
              createBattleParams.entityId,
              new Position({ x: createBattleParams.col, y: createBattleParams.row }),
            );
          },
        },
        "addBattle",
      )
      .name("Add battle");
    createBattleFolder.close();

    const deleteBattleFolder = GUIManager.addFolder("Delete Battle");
    const deleteBattleParams = { entityId: 0 };
    deleteBattleFolder.add(deleteBattleParams, "entityId").name("Entity ID");
    deleteBattleFolder
      .add(
        {
          deleteBattle: () => {
            this.removeBattle(deleteBattleParams.entityId);
          },
        },
        "deleteBattle",
      )
      .name("Delete battle");
    deleteBattleFolder.close();
  }

  async onUpdate(update: BattleSystemUpdate) {
    await this.loadPromise;

    const { entityId, hexCoords, isEmpty, deleted } = update;

    if (deleted) {
      this.removeBattle(entityId);
      return;
    }

    if (isEmpty) {
      if (this.battles.hasByEntityId(entityId)) {
        this.removeBattle(entityId);
        return;
      } else {
        return;
      }
    } else {
      this.addBattle(entityId, hexCoords);
    }
  }

  addBattle(entityId: ID, hexCoords: Position) {
    if (!this.instancedModel) throw new Error("Instanced model not loaded");

    const normalizedCoord = hexCoords.getNormalized();
    const position = getWorldPositionForHex({ col: normalizedCoord.x, row: normalizedCoord.y });

    this.dummy.position.copy(position);
    this.dummy.updateMatrix();

    const index = this.battles.addBattle(entityId, hexCoords);

    this.instancedModel.setMatrixAt(index, this.dummy.matrix);
    this.instancedModel.setCount(this.battles.counter);

    const label = this.labelManager.createLabel(position as any, new THREE.Color("red"));

    this.labels.set(entityId, label);
    this.scene.add(label);
  }

  removeBattle(entityId: ID) {
    if (!this.instancedModel) throw new Error("Instanced model not loaded");

    const meshMatrixIndex = this.battles.getBattleIndex(entityId);

    if (meshMatrixIndex === undefined) throw new Error(`meshMatrixIndex not found for entityId ${entityId}`);

    const newMatrix = new THREE.Matrix4().scale(new THREE.Vector3(0, 0, 0));
    this.instancedModel.setMatrixAt(meshMatrixIndex, newMatrix);
    this.instancedModel.needsUpdate();

    this.battles.removeBattle(entityId);

    const label = this.labels.get(entityId);
    if (!label) throw new Error(`Label not found for entityId ${entityId}`);

    this.labelManager.removeLabel(label, this.scene);
    this.labels.delete(entityId);
  }
}

class Battles {
  private battles: Map<ID, { index: number; position: Position }> = new Map();
  counter: number = 0;

  addBattle(entityId: ID, position: Position): number {
    if (!this.battles.has(entityId)) {
      this.battles.set(entityId, { index: this.counter, position });
      this.counter++;
    }
    return this.battles.get(entityId)!.index;
  }

  getBattleIndex(entityId: ID) {
    return this.battles.get(entityId)?.index;
  }

  hasByPosition(position: Position) {
    return Array.from(this.battles.values()).some((battle) => {
      const battlePosition = battle.position.getContract();
      const positionContract = position.getContract();
      return battlePosition.x === positionContract.x && battlePosition.y === positionContract.y;
    });
  }

  hasByEntityId(entityId: ID) {
    return this.battles.has(entityId);
  }

  removeBattle(entityId: ID) {
    this.battles.delete(entityId);
  }
}
