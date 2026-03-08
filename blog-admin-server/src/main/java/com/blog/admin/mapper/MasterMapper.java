package com.blog.admin.mapper;

import com.blog.admin.model.Master;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface MasterMapper {
    List<Master> findByCategory(@Param("category") String category);
    boolean existsCategory(@Param("category") String category);
}
