// systems/CollisionHandler.jsx
import {
    GameSetting,
    UI,
    ExpOrb,
    gameSounds
} from '@/game/survival';

export default class CollisionHandler {
  constructor(gameEngine) {
    this.engine = gameEngine;
  }

  checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius);
  }

  getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  handleCollisions() {
    this.handlePlayerEnemyCollisions();
    this.handleAttackEnemyCollisions();
    this.handlePlayerExpOrbCollisions();
  }

  handlePlayerEnemyCollisions() {
    this.engine.enemies.forEach(enemy => {
      if (this.checkCollision(this.engine.player, enemy)) {
        if (this.engine.player.tryTakeHit(enemy.contactDamage)) {
          if (this.engine.soundInitialized) {
            gameSounds.playHitSound();
          }
          this.engine.gameEffect.startScreenShake('hit');
          this.engine.gameHandle.onStatsChange({ hp: this.engine.player.hp });
          
          if (this.engine.player.hp <= 0) {
            this.engine.gameHandle.onPlayerDeath();
            return;
          }
        }
      }
    });
  }

  handleAttackEnemyCollisions() {
    const stats = this.engine.gameHandle.getStats();

    this.engine.attackObjs.forEach((attackObj) => {
      this.engine.enemies.forEach((enemy, eIndex) => {
        if (this.checkCollision(attackObj, enemy)) {
          enemy.takeDamage(attackObj.damage);
          attackObj.destroy();

          if (enemy.hp <= 0) {
            this.engine.gameEffect.startEnemyDeathEffect(enemy);
            
            const dropExp = GameSetting.enemies[enemy.type]?.exp || enemy.expValue;
            const orbSkin = UI.expOrbPerEnemy[enemy.type] ?? UI.expOrb;
            this.engine.expOrbs.push(new ExpOrb(enemy.x, enemy.y, dropExp, orbSkin));
            this.engine.enemies.splice(eIndex, 1);
            this.engine.gameHandle.onStatsChange({ kills: stats.kills + 1 });
          }
        }
      });
    });
  }

  handlePlayerExpOrbCollisions() {
    const stats = this.engine.gameHandle.getStats();

    this.engine.expOrbs.forEach((orb, index) => {
      if (this.checkCollision(this.engine.player, orb)) {
        const newExp = stats.exp + orb.value;
        this.engine.expOrbs.splice(index, 1);
        this.engine.gameHandle.onStatsChange({ exp: newExp });

        if (newExp >= stats.maxExp) {
          this.handleLevelUp(newExp, stats);
        }
      }
    });
  }

  handleLevelUp(newExp, stats) {
    const newLevel = stats.level + 1;
    const newMaxExp = stats.maxExp + GameSetting.exp.perLevelIncrement;

    let carriedExp = newExp - stats.maxExp;
    if (carriedExp >= newMaxExp) {
      carriedExp = newMaxExp - 1;
    }

    const healAmount = Math.floor(this.engine.playerStats.maxHp * GameSetting.player.levelUpHealPercent);
    this.engine.player.hp = Math.min(
      this.engine.player.hp + healAmount, 
      this.engine.playerStats.maxHp
    );

    this.engine.gameHandle.onStatsChange({
      level: newLevel,
      exp: carriedExp,
      maxExp: newMaxExp,
      hp: this.engine.player.hp,
      maxHp: this.engine.playerStats.maxHp
    });

    if (this.engine.soundInitialized) {
      gameSounds.playLevelUpSound();
    }

    this.engine.gameHandle.onLevelUp();
  }
}