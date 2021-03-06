import sqlalchemy as sa

from aiohttp_security import (
    setup as setup_security,
    SessionIdentityPolicy
)
from aiohttp_security.abc import AbstractAuthorizationPolicy
from passlib.hash import sha256_crypt


from .model import users


class DBAuthorizationPolicy(AbstractAuthorizationPolicy):
    def __init__(self, app, db_engine_key):
        # Lazy getter
        self._app = app
        self._dbkey = db_engine_key

    @property
    def dbengine(self):
        return self._app[self._dbkey]

    async def authorized_userid(self, identity):
        """Retrieve authorized user id.

        Return the user_id of the user identified by the identity
        or 'None' if no user exists related to the identity.
        """        
        async with self.dbengine.acquire() as conn:
            where = sa.and_(users.c.login == identity,
                            sa.not_(users.c.disabled))
            query = users.count().where(where)
            ret = await conn.scalar(query)
            if ret:
                return identity
            else:
                return None

    async def permits(self, identity, permission, context=None):
        """Check user permissions.

        Return True if the identity is allowed the permission in the
        current context, else return False.
        """
        if identity is None:
            return False

        async with self.dbengine.acquire() as conn:
            where = sa.and_(users.c.login == identity,
                            sa.not_(users.c.disabled))
            query = users.select().where(where)
            ret = await conn.execute(query)
            user = await ret.fetchone()
            if user is not None:
                user_id = user[0]
                is_superuser = user[3]
                if is_superuser:
                    return True

                where = model.permissions.c.user_id == user_id
                query = model.permissions.select().where(where)
                ret = await conn.execute(query)
                result = await ret.fetchall()
                if ret is not None:
                    for record in result:
                        if record.perm_name == permission:
                            return True

            return False


async def check_credentials(db_engine, username, password):
    async with db_engine.acquire() as conn:
        where = sa.and_(users.c.login == username,
                        sa.not_(users.c.disabled))
        query = users.select().where(where)
        ret = await conn.execute(query)
        user = await ret.fetchone()
        if user is not None:
            _hash = user[2]  # password
            return sha256_crypt.verify(password, _hash)
    return False


generate_password_hash = sha256_crypt.hash


def setup_auth(app):
    # WARNING: expected aiosession already initialized!
    identity_policy = SessionIdentityPolicy()

    # FIXME: cannot guarantee correct config key for db's engine!
    authorization_policy = DBAuthorizationPolicy(app, 'db_engine')
    setup_security(app, identity_policy, authorization_policy)
