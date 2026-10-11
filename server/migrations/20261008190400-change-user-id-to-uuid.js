'use strict';

const temporarySuffix = '_uuid_migration';

function quote(queryInterface, identifier) {
  return queryInterface.queryGenerator.quoteIdentifier(identifier);
}

async function getUserReferences(queryInterface, Sequelize) {
  return queryInterface.sequelize.query(
    `SELECT
       kcu.TABLE_NAME AS tableName,
       kcu.COLUMN_NAME AS columnName,
       kcu.CONSTRAINT_NAME AS constraintName,
       rc.UPDATE_RULE AS updateRule,
       rc.DELETE_RULE AS deleteRule
     FROM information_schema.KEY_COLUMN_USAGE AS kcu
     JOIN information_schema.REFERENTIAL_CONSTRAINTS AS rc
       ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
       AND rc.TABLE_NAME = kcu.TABLE_NAME
       AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
     WHERE kcu.CONSTRAINT_SCHEMA = DATABASE()
       AND kcu.REFERENCED_TABLE_NAME = 'users'
       AND kcu.REFERENCED_COLUMN_NAME = 'id'`,
    { type: Sequelize.QueryTypes.SELECT },
  );
}

async function addReplacementReferenceColumns(queryInterface, references, type) {
  for (const reference of references) {
    reference.temporaryColumn = `${reference.columnName}${temporarySuffix}`;
    const columns = await queryInterface.describeTable(reference.tableName);
    if (columns[reference.temporaryColumn]) {
      throw new Error(
        `Temporary migration column ${reference.tableName}.${reference.temporaryColumn} already exists`,
      );
    }

    reference.originalColumn = columns[reference.columnName];
    await queryInterface.addColumn(reference.tableName, reference.temporaryColumn, {
      type,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE ${quote(queryInterface, reference.tableName)} AS child
       JOIN ${quote(queryInterface, 'users')} AS parent
         ON child.${quote(queryInterface, reference.columnName)} = parent.${quote(queryInterface, 'id')}
       SET child.${quote(queryInterface, reference.temporaryColumn)} = parent.${quote(queryInterface, '__newUserId')}`,
    );
  }
}

async function removeUserReferenceConstraints(queryInterface, references) {
  for (const reference of references) {
    await queryInterface.removeConstraint(reference.tableName, reference.constraintName);
  }
}

async function replaceReferenceColumns(queryInterface, references, type) {
  for (const reference of references) {
    await queryInterface.removeColumn(reference.tableName, reference.columnName);
    await queryInterface.renameColumn(
      reference.tableName,
      reference.temporaryColumn,
      reference.columnName,
    );
    await queryInterface.changeColumn(reference.tableName, reference.columnName, {
      type,
      allowNull: reference.originalColumn.allowNull,
    });
  }
}

async function replaceUserPrimaryKey(
  queryInterface,
  currentType,
  type,
  autoIncrement,
) {
  await queryInterface.changeColumn('users', 'id', {
    type: currentType,
    allowNull: false,
    autoIncrement: false,
  });
  await queryInterface.sequelize.query(
    `ALTER TABLE ${quote(queryInterface, 'users')} DROP PRIMARY KEY`,
  );
  await queryInterface.removeColumn('users', 'id');
  await queryInterface.renameColumn('users', '__newUserId', 'id');
  await queryInterface.changeColumn('users', 'id', {
    type,
    allowNull: false,
  });
  await queryInterface.addConstraint('users', {
    fields: ['id'],
    type: 'primary key',
  });

  if (autoIncrement) {
    await queryInterface.changeColumn('users', 'id', {
      type,
      allowNull: false,
      autoIncrement: true,
    });
  }
}

async function restoreUserReferenceConstraints(queryInterface, references) {
  for (const reference of references) {
    await queryInterface.addConstraint(reference.tableName, {
      fields: [reference.columnName],
      type: 'foreign key',
      name: reference.constraintName,
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: reference.updateRule,
      onDelete: reference.deleteRule,
    });
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const references = await getUserReferences(queryInterface, Sequelize);

    await queryInterface.addColumn('users', '__newUserId', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.sequelize.query(
      `UPDATE ${quote(queryInterface, 'users')}
       SET ${quote(queryInterface, '__newUserId')} = UUID()`,
    );
    await queryInterface.changeColumn('users', '__newUserId', {
      type: Sequelize.UUID,
      allowNull: false,
    });

    await addReplacementReferenceColumns(queryInterface, references, Sequelize.UUID);
    await removeUserReferenceConstraints(queryInterface, references);
    await replaceReferenceColumns(queryInterface, references, Sequelize.UUID);
    await replaceUserPrimaryKey(
      queryInterface,
      Sequelize.INTEGER,
      Sequelize.UUID,
      false,
    );
    await restoreUserReferenceConstraints(queryInterface, references);
  },

  async down(queryInterface, Sequelize) {
    const references = await getUserReferences(queryInterface, Sequelize);

    await queryInterface.addColumn('users', '__newUserId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.sequelize.query('SET @new_user_id = 0');
    await queryInterface.sequelize.query(
      `UPDATE ${quote(queryInterface, 'users')}
       SET ${quote(queryInterface, '__newUserId')} = (@new_user_id := @new_user_id + 1)
       ORDER BY ${quote(queryInterface, 'id')}`,
    );
    await queryInterface.changeColumn('users', '__newUserId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await addReplacementReferenceColumns(queryInterface, references, Sequelize.INTEGER);
    await removeUserReferenceConstraints(queryInterface, references);
    await replaceReferenceColumns(queryInterface, references, Sequelize.INTEGER);
    await replaceUserPrimaryKey(
      queryInterface,
      Sequelize.UUID,
      Sequelize.INTEGER,
      true,
    );
    await restoreUserReferenceConstraints(queryInterface, references);
  },
};
